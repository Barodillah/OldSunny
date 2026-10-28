<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Sales;
use Illuminate\Support\Facades\DB;

class EmployeeController extends Controller
{
    /**
     * Helper to read json or form data safely
     */
    private function getPayload(Request $request): array
    {
        return $request->json()->all() ?: $request->all();
    }

    // =========================================================================
    // 1. STRUKTUR ORGANISASI (EMPLOYEES)
    // =========================================================================

    /**
     * Get employees list or structured by levels for Organization UI
     */
    public function getEmployees(Request $request)
    {
        $status = $request->query('status', 'active');
        $level = $request->query('level');
        $search = trim($request->query('search', ''));
        $structured = $request->boolean('structured', false);

        $query = Employee::with('salesTeam');

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($level) {
            $query->where('level', $level);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('role', 'like', "%{$search}%")
                  ->orWhere('department', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%");
            });
        }

        // Return structured tiers if requested (matching Organization.jsx levels)
        if ($structured) {
            $allEmployees = $query->orderBy('id', 'asc')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'direksi' => $allEmployees->where('level', 'direksi')->values(),
                    'csm' => $allEmployees->where('level', 'csm')->values(),
                    'managerial' => $allEmployees->where('level', 'managerial')->values(),
                    'supervisor' => $allEmployees->where('level', 'supervisor')->values(),
                ],
                'counts' => [
                    'total' => $allEmployees->count(),
                    'direksi' => $allEmployees->where('level', 'direksi')->count(),
                    'csm' => $allEmployees->where('level', 'csm')->count(),
                    'managerial' => $allEmployees->where('level', 'managerial')->count(),
                    'supervisor' => $allEmployees->where('level', 'supervisor')->count(),
                ]
            ]);
        }

        $employees = $query->orderBy('id', 'desc')->paginate(30);

        return response()->json([
            'success' => true,
            'data' => $employees
        ]);
    }

    /**
     * Store new employee (Jabatan Baru)
     * For direksi and csm, enforces rule: only 1 active allowed
     */
    public function storeEmployee(Request $request)
    {
        $data = $this->getPayload($request);

        $name = trim($data['name'] ?? '');
        $role = trim($data['role'] ?? '');
        $level = trim($data['level'] ?? '');

        if (!$name || !$role || !$level) {
            return response()->json([
                'success' => false,
                'message' => 'Nama lengkap, jabatan (role), dan level struktur wajib diisi.'
            ], 422);
        }

        if (!in_array($level, ['direksi', 'csm', 'managerial', 'supervisor'])) {
            return response()->json([
                'success' => false,
                'message' => 'Level struktur tidak valid. Pilihan: direksi, csm, managerial, supervisor.'
            ], 422);
        }

        // Rule for Direksi and CSM: Only 1 active person allowed at a time
        if (in_array($level, ['direksi', 'csm'])) {
            $existingActive = Employee::where('level', $level)->where('status', 'active')->first();
            if ($existingActive) {
                $levelLabel = $level === 'direksi' ? 'Direksi / Branch Manager' : 'Customer Satisfaction Manager (CSM)';
                return response()->json([
                    'success' => false,
                    'message' => "Level {$levelLabel} hanya boleh memiliki 1 pejabat aktif. Gunakan fitur 'Ganti Pejabat' untuk menonaktifkan pejabat lama dan mengangkat pejabat baru."
                ], 422);
            }
        }

        $employee = Employee::create([
            'name' => $name,
            'role' => $role,
            'level' => $level,
            'department' => $data['department'] ?? null,
            'photo_url' => $data['photo_url'] ?? 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
            'description' => $data['description'] ?? null,
            'tenure' => $data['tenure'] ?? null,
            'nik' => $data['nik'] ?? null,
            'badge' => $data['badge'] ?? null,
            'status' => 'active',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Karyawan / Pejabat struktur berhasil ditambahkan.',
            'data' => $employee
        ], 201);
    }

    /**
     * Ganti Pejabat (Replace existing employee)
     * Aturan: pejabat lama dinonaktifkan ke tabel nonaktif, lalu dibuat record pejabat baru aktif
     */
    public function replaceEmployee(Request $request, $id)
    {
        $oldEmployee = Employee::find($id);
        if (!$oldEmployee) {
            return response()->json([
                'success' => false,
                'message' => 'Data pejabat yang akan digantikan tidak ditemukan.'
            ], 404);
        }

        $data = $this->getPayload($request);
        $newName = trim($data['name'] ?? '');
        $newRole = trim($data['role'] ?? $oldEmployee->role);

        if (!$newName) {
            return response()->json([
                'success' => false,
                'message' => 'Nama lengkap pejabat baru wajib diisi.'
            ], 422);
        }

        DB::beginTransaction();
        try {
            // 1. Nonaktifkan pejabat lama
            $oldEmployee->status = 'inactive';
            $oldEmployee->deactivated_at = now();
            $oldEmployee->deactivated_reason = "Digantikan oleh {$newName} (" . ($data['notes'] ?? 'Regenerasi jabatan') . ")";
            $oldEmployee->save();

            // 2. Buat pejabat baru dengan status active pada level yang sama
            $newEmployee = Employee::create([
                'name' => $newName,
                'role' => $newRole,
                'level' => $oldEmployee->level,
                'department' => $data['department'] ?? $oldEmployee->department,
                'photo_url' => $data['photo_url'] ?? 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'description' => $data['description'] ?? null,
                'tenure' => $data['tenure'] ?? 'Baru Menjabat',
                'nik' => $data['nik'] ?? null,
                'badge' => $data['badge'] ?? $oldEmployee->badge,
                'status' => 'active',
            ]);

            // Jika pejabat lama adalah Supervisor, alihkan tim sales yang menginduk ke supervisor baru
            if ($oldEmployee->level === 'supervisor') {
                Sales::where('supervisor_id', $oldEmployee->id)
                     ->update(['supervisor_id' => $newEmployee->id]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Pejabat berhasil diganti. Data {$oldEmployee->name} dialihkan ke arsip nonaktif, dan {$newEmployee->name} resmi aktif.",
                'data' => [
                    'new_employee' => $newEmployee,
                    'old_employee' => $oldEmployee
                ]
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses pergantian pejabat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update employee info
     */
    public function updateEmployee(Request $request, $id)
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Data karyawan tidak ditemukan.'
            ], 404);
        }

        $data = $this->getPayload($request);

        if (isset($data['name'])) $employee->name = trim($data['name']);
        if (isset($data['role'])) $employee->role = trim($data['role']);
        if (isset($data['department'])) $employee->department = $data['department'];
        if (isset($data['photo_url'])) $employee->photo_url = $data['photo_url'];
        if (isset($data['description'])) $employee->description = $data['description'];
        if (isset($data['tenure'])) $employee->tenure = $data['tenure'];
        if (isset($data['nik'])) $employee->nik = $data['nik'];
        if (isset($data['badge'])) $employee->badge = $data['badge'];

        $employee->save();

        return response()->json([
            'success' => true,
            'message' => 'Informasi karyawan berhasil diperbarui.',
            'data' => $employee
        ]);
    }

    /**
     * Toggle employee status (Active / Inactive)
     */
    public function toggleEmployeeStatus(Request $request, $id)
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Data karyawan tidak ditemukan.'
            ], 404);
        }

        $data = $this->getPayload($request);
        $newStatus = $data['status'] ?? ($employee->status === 'active' ? 'inactive' : 'active');

        // Jika mengaktifkan Direksi atau CSM, pastikan tidak ada pejabat aktif lain
        if ($newStatus === 'active' && in_array($employee->level, ['direksi', 'csm'])) {
            $otherActive = Employee::where('level', $employee->level)
                ->where('status', 'active')
                ->where('id', '!=', $employee->id)
                ->first();

            if ($otherActive) {
                return response()->json([
                    'success' => false,
                    'message' => "Tidak dapat mengaktifkan. Saat ini sudah ada pejabat aktif ({$otherActive->name}) di level {$employee->level}. Silakan nonaktifkan pejabat tersebut terlebih dahulu atau gunakan fitur 'Ganti Pejabat'."
                ], 422);
            }
        }

        $employee->status = $newStatus;
        if ($newStatus === 'inactive') {
            $employee->deactivated_at = now();
            $employee->deactivated_reason = $data['reason'] ?? 'Dinonaktifkan oleh administrator dealer';
        } else {
            $employee->deactivated_at = null;
            $employee->deactivated_reason = null;
        }

        $employee->save();

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'active' ? 'Karyawan berhasil diaktifkan kembali.' : 'Karyawan berhasil dinonaktifkan.',
            'data' => $employee
        ]);
    }

    /**
     * Delete employee permanently
     */
    public function deleteEmployee($id)
    {
        $employee = Employee::find($id);
        if (!$employee) {
            return response()->json([
                'success' => false,
                'message' => 'Data karyawan tidak ditemukan.'
            ], 404);
        }

        $employee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data karyawan berhasil dihapus secara permanen.'
        ]);
    }

    // =========================================================================
    // 2. SALES (WIRANIAGA MENGINDUK KE SPV)
    // =========================================================================

    /**
     * Get active sales list (with SPV relationship)
     */
    public function getSales(Request $request)
    {
        $status = $request->query('status', 'active');
        $supervisorId = $request->query('supervisor_id');
        $search = trim($request->query('search', ''));

        $query = Sales::with(['supervisor' => function ($q) {
            $q->select('id', 'name', 'badge', 'role', 'status');
        }]);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($supervisorId) {
            $query->where('supervisor_id', $supervisorId);
        }

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%")
                  ->orWhere('nik', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('specialization', 'like', "%{$search}%");
            });
        }

        $sales = $query->orderBy('id', 'asc')->get();

        // Get list of active supervisors for dropdown choices
        $supervisors = Employee::where('level', 'supervisor')
            ->where('status', 'active')
            ->select('id', 'name', 'badge', 'role')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sales,
            'supervisors' => $supervisors,
            'total' => $sales->count()
        ]);
    }

    /**
     * Store new sales consultant
     * ATURAN: Sales HARUS menginduk ke salah satu supervisor aktif
     */
    public function storeSales(Request $request)
    {
        $data = $this->getPayload($request);

        $name = trim($data['name'] ?? '');
        $supervisorId = $data['supervisor_id'] ?? null;

        if (!$name) {
            return response()->json([
                'success' => false,
                'message' => 'Nama lengkap wiraniaga (sales) wajib diisi.'
            ], 422);
        }

        // Validasi wajib menginduk ke SPV
        if (!$supervisorId) {
            return response()->json([
                'success' => false,
                'message' => 'Khusus wiraniaga (sales) wajib menginduk ke salah satu Supervisor. Silakan pilih Supervisor penginduk.'
            ], 422);
        }

        $spv = Employee::where('id', $supervisorId)
            ->where('level', 'supervisor')
            ->first();

        if (!$spv) {
            return response()->json([
                'success' => false,
                'message' => 'Supervisor yang dipilih tidak valid atau bukan bertipe Supervisor.'
            ], 422);
        }

        $sales = Sales::create([
            'name' => $name,
            'supervisor_id' => $supervisorId,
            'position' => $data['position'] ?? 'Sales Consultant',
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'nik' => $data['nik'] ?? null,
            'photo_url' => $data['photo_url'] ?? 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
            'specialization' => $data['specialization'] ?? null,
            'tenure' => $data['tenure'] ?? 'Baru Bergabung',
            'joined_year' => $data['joined_year'] ?? date('Y'),
            'status' => 'active',
            'notes' => $data['notes'] ?? null,
        ]);

        $sales->load('supervisor');

        return response()->json([
            'success' => true,
            'message' => "Wiraniaga {$sales->name} berhasil didaftarkan di bawah bimbingan SPV {$spv->name}.",
            'data' => $sales
        ], 201);
    }

    /**
     * Update sales info
     */
    public function updateSales(Request $request, $id)
    {
        $sales = Sales::find($id);
        if (!$sales) {
            return response()->json([
                'success' => false,
                'message' => 'Data sales tidak ditemukan.'
            ], 404);
        }

        $data = $this->getPayload($request);

        // Jika mengubah supervisor_id, validasi wajib SPV valid
        if (array_key_exists('supervisor_id', $data)) {
            $supervisorId = $data['supervisor_id'];
            if (!$supervisorId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Khusus wiraniaga (sales) harus menginduk ke salah satu Supervisor.'
                ], 422);
            }
            $spv = Employee::where('id', $supervisorId)
                ->where('level', 'supervisor')
                ->first();
            if (!$spv) {
                return response()->json([
                    'success' => false,
                    'message' => 'Supervisor yang dipilih tidak valid.'
                ], 422);
            }
            $sales->supervisor_id = $supervisorId;
        }

        if (isset($data['name'])) $sales->name = trim($data['name']);
        if (isset($data['position'])) $sales->position = trim($data['position']);
        if (isset($data['phone'])) $sales->phone = $data['phone'];
        if (isset($data['email'])) $sales->email = $data['email'];
        if (isset($data['nik'])) $sales->nik = $data['nik'];
        if (isset($data['photo_url'])) $sales->photo_url = $data['photo_url'];
        if (isset($data['specialization'])) $sales->specialization = $data['specialization'];
        if (isset($data['tenure'])) $sales->tenure = $data['tenure'];
        if (isset($data['joined_year'])) $sales->joined_year = $data['joined_year'];
        if (isset($data['notes'])) $sales->notes = $data['notes'];

        $sales->save();
        $sales->load('supervisor');

        return response()->json([
            'success' => true,
            'message' => 'Data wiraniaga berhasil diperbarui.',
            'data' => $sales
        ]);
    }

    /**
     * Toggle sales status (Active / Inactive)
     */
    public function toggleSalesStatus(Request $request, $id)
    {
        $sales = Sales::find($id);
        if (!$sales) {
            return response()->json([
                'success' => false,
                'message' => 'Data sales tidak ditemukan.'
            ], 404);
        }

        $data = $this->getPayload($request);
        $newStatus = $data['status'] ?? ($sales->status === 'active' ? 'inactive' : 'active');

        $sales->status = $newStatus;
        if ($newStatus === 'inactive') {
            $sales->deactivated_at = now();
            $sales->deactivated_reason = $data['reason'] ?? 'Dinonaktifkan oleh administrator dealer';
        } else {
            $sales->deactivated_at = null;
            $sales->deactivated_reason = null;
        }

        $sales->save();
        $sales->load('supervisor');

        return response()->json([
            'success' => true,
            'message' => $newStatus === 'active' ? 'Sales berhasil diaktifkan kembali.' : 'Sales berhasil dinonaktifkan.',
            'data' => $sales
        ]);
    }

    /**
     * Delete sales record permanently
     */
    public function deleteSales($id)
    {
        $sales = Sales::find($id);
        if (!$sales) {
            return response()->json([
                'success' => false,
                'message' => 'Data sales tidak ditemukan.'
            ], 404);
        }

        $sales->delete();

        return response()->json([
            'success' => true,
            'message' => 'Data sales berhasil dihapus secara permanen.'
        ]);
    }

    // =========================================================================
    // 3. ARSIP NONAKTIF (EMPLOYEES + SALES)
    // =========================================================================

    /**
     * Get all inactive employees and sales
     */
    public function getInactiveRecords(Request $request)
    {
        $filterType = $request->query('type', 'all'); // 'all', 'employee', 'sales'
        $search = trim($request->query('search', ''));

        $inactiveEmployees = [];
        $inactiveSales = [];

        if ($filterType === 'all' || $filterType === 'employee') {
            $empQuery = Employee::inactive();
            if ($search !== '') {
                $empQuery->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('role', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%");
                });
            }
            $inactiveEmployees = $empQuery->orderBy('deactivated_at', 'desc')->get()->map(function ($item) {
                $item->record_type = 'employee';
                return $item;
            });
        }

        if ($filterType === 'all' || $filterType === 'sales') {
            $salesQuery = Sales::with(['supervisor' => function ($q) {
                $q->select('id', 'name', 'badge');
            }])->inactive();
            if ($search !== '') {
                $salesQuery->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('position', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%");
                });
            }
            $inactiveSales = $salesQuery->orderBy('deactivated_at', 'desc')->get()->map(function ($item) {
                $item->record_type = 'sales';
                return $item;
            });
        }

        return response()->json([
            'success' => true,
            'data' => [
                'employees' => $inactiveEmployees,
                'sales' => $inactiveSales,
            ],
            'counts' => [
                'employees' => Employee::inactive()->count(),
                'sales' => Sales::inactive()->count(),
                'total' => Employee::inactive()->count() + Sales::inactive()->count(),
            ]
        ]);
    }
}
