<?php

namespace App\Http\Controllers;

use App\Services\FinanceInsightsService;
use Illuminate\Http\Request;

class FinanceInsightsController extends Controller
{
    public function index(
        Request $request,
        FinanceInsightsService $service
    ) {
        $companyId =
            $request->user()->company_id;

        return response()->json(
            $service->build($companyId)
        );
    }
}