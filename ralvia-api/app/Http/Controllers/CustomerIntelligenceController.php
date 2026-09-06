<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Services\CustomerIntelligenceService;
use Illuminate\Http\Request;

class CustomerIntelligenceController extends Controller
{
    public function index(
        Request $request,
        CustomerIntelligenceService $service
    ) {
        $companyId =
            $request->user()->company_id;

        $customers = Customer::where(
            'company_id',
            $companyId
        )
            ->orderBy('name')
            ->get();

        $results = $customers->map(
            fn ($customer) =>
                $service->analyze($customer)
        );

        return response()->json([
            'count' => $results->count(),
            'customers' => $results,
        ]);
    }
}