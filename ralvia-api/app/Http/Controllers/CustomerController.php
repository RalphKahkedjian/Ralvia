<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    // get all customers
    public function index(Request $request) {
        return Customer::where(
            'company_id',
            $request->user()->company_id
        )->get();
    }
    // create customer method
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
        ]);

        $customer = Customer::create([
            ...$validated,
            'company_id' => $request->user()->company_id,
        ]);

        return response()->json($customer, 201);
    }
}
