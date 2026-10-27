<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\NewsletterSubscriber;
use Illuminate\Support\Facades\Validator;

class NewsletterSubscriberController extends Controller
{
    /**
     * Subscribe an email to the newsletter / update promo.
     */
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:191',
            'source' => 'nullable|string|max:100'
        ], [
            'email.required' => 'Silakan masukkan alamat email Anda.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.max' => 'Alamat email maksimal 191 karakter.'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors()
            ], 422);
        }

        $email = strtolower(trim((string) $request->input('email')));
        $source = $request->input('source', 'contact_page');

        $subscriber = NewsletterSubscriber::where('email', $email)->first();

        if ($subscriber) {
            if ($subscriber->status !== 'active') {
                $subscriber->update([
                    'status' => 'active',
                    'source' => $source ?: $subscriber->source,
                    'ip_address' => $request->ip(),
                    'user_agent' => $request->userAgent()
                ]);

                return response()->json([
                    'success' => true,
                    'is_reactivated' => true,
                    'message' => 'Email Anda berhasil diaktifkan kembali untuk berlangganan buletin promo!',
                    'data' => $subscriber
                ]);
            }

            return response()->json([
                'success' => true,
                'is_existing' => true,
                'message' => 'Email Anda sudah terdaftar dalam buletin promo resmi.',
                'data' => $subscriber
            ]);
        }

        $subscriber = NewsletterSubscriber::create([
            'email' => $email,
            'status' => 'active',
            'source' => $source,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih! Alamat email Anda telah berhasil terdaftar untuk menerima update promo resmi.',
            'data' => $subscriber
        ], 201);
    }

    /**
     * List all newsletter subscribers for management portal.
     */
    public function index(Request $request)
    {
        $search = $request->query('search');
        $status = $request->query('status');

        $query = NewsletterSubscriber::orderBy('created_at', 'desc');

        if ($status && $status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->where('email', 'like', "%{$search}%");
        }

        $counts = [
            'all' => NewsletterSubscriber::count(),
            'active' => NewsletterSubscriber::where('status', 'active')->count(),
            'unsubscribed' => NewsletterSubscriber::where('status', 'unsubscribed')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $query->paginate(20),
            'counts' => $counts
        ]);
    }

    /**
     * Toggle or unsubscribe a subscriber.
     */
    public function destroy($id)
    {
        $subscriber = NewsletterSubscriber::find($id);

        if (!$subscriber) {
            return response()->json([
                'success' => false,
                'message' => 'Data pelanggan email tidak ditemukan.'
            ], 404);
        }

        $subscriber->delete();

        return response()->json([
            'success' => true,
            'message' => 'Pelanggan newsletter berhasil dihapus.'
        ]);
    }
}
