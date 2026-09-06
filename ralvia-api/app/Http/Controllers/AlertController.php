<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request) {
        $alerts = Alert::with('invoice.customer')
            ->where('company_id', $request->user()->company_id)
            ->latest()
            ->get();

            return response()->json($alerts);
    }
}
