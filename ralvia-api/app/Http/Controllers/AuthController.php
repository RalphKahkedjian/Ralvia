<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Company;
use Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // register method
public function register(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'company_name' => 'required|string|max:255',
        'email' => 'required|email|unique:users,email',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = DB::transaction(function () use ($validated) {

        $company = Company::create([
            'name' => $validated['company_name'],
        ]);

        return User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'company_id' => $company->id,
        ]);
    });

    return response()->json([
        'message' => 'User registered successfully',
        'user' => $user,
    ], 201);
}

    // login method
public function login(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email',
        'password' => 'required|string',
    ]);

    if (!Auth::guard('web')->attempt([
        'email' => $validated['email'],
        'password' => $validated['password'],
    ])) {
        return response()->json([
            'message' => 'Invalid credentials.'
        ], 401);
    }

    $request->session()->regenerate();

    return response()->json([
        'message' => 'Login successful',
        'user' => Auth::guard('web')->user(),
    ]);
}

    // logout method
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

}