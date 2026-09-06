<?php

namespace App\Http\Controllers;

use App\Services\FinanceAgentService;
use Illuminate\Http\Request;

class FinanceAgentController extends Controller
{
    public function run(
        Request $request,
        FinanceAgentService $agent
    ) {
        $result = $agent->run($request->user());

        return response()->json([
            'message' => 'Finance agent scan completed.',
            ...$result,
        ]);
    }
}