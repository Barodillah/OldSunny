<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Superadmin (Khusus Developer / System Architect)
        User::updateOrCreate(
            ['email' => 'dev@sunmargahayu.co.id'],
            [
                'nik' => 'SNY-DEV-001',
                'name' => 'Dev Antigravity',
                'phone' => '081289001234',
                'password' => Hash::make('developer2026'),
                'position' => 'Lead System Architect & Developer',
                'role' => 'superadmin',
                'department' => 'Information Technology',
                'status' => 'active',
                'avatar' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // 2. Admin (Manajemen Dealer / Kepala Cabang)
        User::updateOrCreate(
            ['email' => 'admin@sunmargahayu.co.id'],
            [
                'nik' => 'SNY-ADM-001',
                'name' => 'Hendra Gunawan',
                'phone' => '081298765432',
                'password' => Hash::make('password123'),
                'position' => 'Operational Branch Manager',
                'role' => 'admin',
                'department' => 'Executive Leadership',
                'status' => 'active',
                'avatar' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // 3. User (Staf / Senior Sales)
        User::updateOrCreate(
            ['email' => 'agnes@sunmargahayu.co.id'],
            [
                'nik' => 'SNY-SLS-0412',
                'name' => 'Agnes Maharani',
                'phone' => '081311223344',
                'password' => Hash::make('user2026'),
                'position' => 'Senior Sales Executive',
                'role' => 'user',
                'department' => 'Sales & Marketing',
                'status' => 'active',
                'avatar' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );

        // 4. User (Service Advisor)
        User::updateOrCreate(
            ['email' => 'rudi.service@sunmargahayu.co.id'],
            [
                'nik' => 'SNY-SVC-0104',
                'name' => 'Rudi Hermawan',
                'phone' => '081399887766',
                'password' => Hash::make('user2026'),
                'position' => 'Service Advisor Coordinator',
                'role' => 'user',
                'department' => 'Aftersales & Service',
                'status' => 'active',
                'avatar' => 'https://bewhy.id/wp-content/uploads/asset_6ad472d88f4b22.95376401.jpg',
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]
        );
    }
}
