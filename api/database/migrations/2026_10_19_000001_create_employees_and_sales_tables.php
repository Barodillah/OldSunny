<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Table Employees (Struktur Organisasi Dealer)
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('role'); // e.g. Branch Manager, Service Manager, Supervisor, dll.
            $table->string('level'); // 'direksi', 'csm', 'managerial', 'supervisor'
            $table->string('department')->nullable();
            $table->text('photo_url')->nullable();
            $table->text('description')->nullable();
            $table->string('tenure')->nullable(); // e.g. '12 Tahun Pengalaman'
            $table->string('nik')->nullable(); // e.g. 'SNY-DIR-0101'
            $table->string('badge')->nullable(); // e.g. 'Pimpinan Cabang', 'Tim I'
            $table->string('status')->default('active'); // 'active', 'inactive'
            $table->timestamp('deactivated_at')->nullable();
            $table->string('deactivated_reason')->nullable();
            $table->timestamps();

            $table->index('level');
            $table->index('status');
        });

        // 2. Table Sales (Wiraniaga / Sales Consultants yang menginduk ke SPV)
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('supervisor_id')
                  ->nullable()
                  ->constrained('employees')
                  ->nullOnDelete();
            $table->string('position')->default('Sales Consultant'); // e.g. Senior Sales Executive, Sales Specialist
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('nik')->nullable();
            $table->text('photo_url')->nullable();
            $table->string('specialization')->nullable(); // e.g. 'SUV & Varian Hybrid', 'Canter & Niaga'
            $table->string('tenure')->nullable(); // e.g. '4 Tahun'
            $table->string('joined_year')->nullable(); // e.g. '2022'
            $table->string('status')->default('active'); // 'active', 'inactive'
            $table->timestamp('deactivated_at')->nullable();
            $table->string('deactivated_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('supervisor_id');
            $table->index('status');
        });

        // Seed Initial Employees from Organization.jsx
        $now = now();
        $employeesData = [
            [
                'name' => 'Fendy Haryanto',
                'role' => 'Branch Manager',
                'level' => 'direksi',
                'department' => 'Branch Executive & Operational Leadership',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6acf43d62380a8.00133085.png',
                'description' => 'Bertanggung jawab penuh atas arah strategis, integritas transaksi dealer resmi, dan tata kelola operasional Mitsubishi Sun Margahayu.',
                'tenure' => '12 Tahun Pengalaman',
                'nik' => 'SNY-DIR-0101',
                'badge' => 'Pimpinan Cabang',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Adi Ponco Prasetyo',
                'role' => 'Customer Satisfaction Manager',
                'level' => 'csm',
                'department' => 'Customer Satisfaction & Quality Assurance',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6acf43d623df40.72416869.jpeg',
                'description' => 'Bertanggung jawab langsung kepada Branch Manager dalam mengawasi indeks kepuasan pelanggan, penanganan masukan konsumen, serta audit standar mutu pelayanan dealer resmi.',
                'tenure' => '9 Tahun Pengalaman',
                'nik' => 'SNY-CSM-0205',
                'badge' => 'Mutu & Kepuasan Pelanggan',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Muhamad Santiko',
                'role' => 'Service Manager',
                'level' => 'managerial',
                'department' => 'Bengkel Resmi & Pelayanan Purna Jual',
                'photo_url' => 'https://cssunmotor.com/wp-content/uploads/asset_6ad4f2fde1e349.91841935.jpeg',
                'description' => 'Memimpin tim mekanik bersertifikat MMKSI, jaminan kualitas perawatan berkala, perbaikan mesin, dan layanan Emergency SOS 24 Jam.',
                'tenure' => '10 Tahun Pengalaman',
                'nik' => 'SNY-MGR-0311',
                'badge' => 'Purna Jual & Bengkel',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Surie Handayani',
                'role' => 'Admin Head',
                'level' => 'managerial',
                'department' => 'Administrasi, Keuangan & Verifikasi Sah',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad4722c138b93.90082080.png',
                'description' => 'Mengawasi kepatuhan administrasi faktur, STNK/BPKB, serta memastikan seluruh transaksi uang muka disalurkan hanya ke rekening resmi dealer PT Sun Star Prima Motor.',
                'tenure' => '8 Tahun Pengalaman',
                'nik' => 'SNY-MGR-0324',
                'badge' => 'Legal & Keuangan',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Joko Triono',
                'role' => 'Sparepart Manager',
                'level' => 'managerial',
                'department' => 'Suku Cadang Asli Mitsubishi Motors Genuine Parts',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad4722c11cc89.85094896.png',
                'description' => 'Menjamin ketersediaan suku cadang asli bergaransi pabrikan untuk varian kendaraan penumpang maupun kendaraan niaga berat.',
                'tenure' => '11 Tahun Pengalaman',
                'nik' => 'SNY-MGR-0338',
                'badge' => 'Suku Cadang Asli',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Yusuf Anshori',
                'role' => 'Supervisor',
                'level' => 'supervisor',
                'department' => 'Supervisi Operasional Wiraniaga & Fleet',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'description' => 'Membimbing dan mengawal kualitas interaksi wiraniaga dengan konsumen serta koordinasi unit pengadaan armada komersial.',
                'tenure' => '6 Tahun Pengalaman',
                'nik' => 'SNY-SPV-0419',
                'badge' => 'Tim I',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Riki Melianto',
                'role' => 'Supervisor',
                'level' => 'supervisor',
                'department' => 'Supervisi Layanan Konsultasi & Test Drive',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'description' => 'Memastikan seluruh proses uji jalan (Test Drive) dan simulasi kredit berjalan transparan, ramah, dan sesuai standar H.O.M.E.',
                'tenure' => '5 Tahun Pengalaman',
                'nik' => 'SNY-SPV-0428',
                'badge' => 'Tim II',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('employees')->insert($employeesData);

        // Ambil ID Supervisor untuk mengindukkan sales
        $spv1 = DB::table('employees')->where('name', 'Yusuf Anshori')->value('id');
        $spv2 = DB::table('employees')->where('name', 'Riki Melianto')->value('id');

        $salesData = [
            [
                'name' => 'Agnes',
                'supervisor_id' => $spv1,
                'position' => 'Senior Sales Executive',
                'phone' => '081289001234',
                'email' => 'agnes.sales@sunmotor.co.id',
                'nik' => 'SNY-SLS-0412',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'specialization' => 'SUV & Varian Hybrid',
                'tenure' => '6 Tahun',
                'joined_year' => '2020',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Amin',
                'supervisor_id' => $spv1,
                'position' => 'Sales Specialist',
                'phone' => '081377889900',
                'email' => 'amin.sales@sunmotor.co.id',
                'nik' => 'SNY-SLS-0588',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'specialization' => 'Family MPV & Crossover',
                'tenure' => '4 Tahun',
                'joined_year' => '2022',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Bambang Prakoso',
                'supervisor_id' => $spv2,
                'position' => 'Junior Sales Advisor',
                'phone' => '085712345678',
                'email' => 'bambang.sales@sunmotor.co.id',
                'nik' => 'SNY-SLS-0721',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'specialization' => 'Uji Jalan & Pembiayaan Syariah',
                'tenure' => '2.5 Tahun',
                'joined_year' => '2023',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Dimas Setiawan',
                'supervisor_id' => $spv2,
                'position' => 'Commercial Vehicle Specialist',
                'phone' => '081299887766',
                'email' => 'dimas.sales@sunmotor.co.id',
                'nik' => 'SNY-SLS-0819',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'specialization' => 'Canter, Fighter X & Niaga',
                'tenure' => '3 Tahun',
                'joined_year' => '2023',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Eko Prasetyo',
                'supervisor_id' => $spv1,
                'position' => 'Fleet Consultant',
                'phone' => '087811223344',
                'email' => 'eko.sales@sunmotor.co.id',
                'nik' => 'SNY-SLS-0901',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'specialization' => 'Armada Perusahaan & Koperasi',
                'tenure' => '5 Tahun',
                'joined_year' => '2021',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Fitri Handayani',
                'supervisor_id' => $spv2,
                'position' => 'Sales Consultant',
                'phone' => '082155667788',
                'email' => 'fitri.sales@sunmotor.co.id',
                'nik' => 'SNY-SLS-0945',
                'photo_url' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'specialization' => 'Konsultasi Cicilan Ringan & Promo',
                'tenure' => '2 Tahun',
                'joined_year' => '2024',
                'status' => 'active',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ];

        DB::table('sales')->insert($salesData);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sales');
        Schema::dropIfExists('employees');
    }
};
