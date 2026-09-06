<?php

use App\Http\Controllers\AiActionController;
use App\Http\Controllers\AlertController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\CustomerIntelligenceController;
use App\Http\Controllers\FinanceAgentController;
use App\Http\Controllers\FinanceChatController;
use App\Http\Controllers\FinanceInsightsController;
use App\Http\Controllers\ForecastController;
use App\Http\Controllers\InvoiceExportController;
use App\Http\Controllers\MlTrainingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\InvoiceController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::post(
    '/ai-actions/{aiAction}/reject',
    [AiActionController::class, 'reject']
    );

    Route::get(
    '/ai-actions',
    [AiActionController::class, 'index']
    );

    Route::post(
    '/ai-actions/{aiAction}/send',
    [AiActionController::class, 'send']
    );

    Route::post(
    '/agent/run',
    [FinanceAgentController::class, 'run']
    );
    
    Route::get('/alerts', [AlertController::class, 'index']);

    Route::post( '/ai-actions/{aiAction}/approve',       [AiActionController::class, 'approve']
    );

    Route::get(
    '/analytics/overview',
    [AnalyticsController::class, 'overview']
    );

    Route::post(
    '/analytics/explain',
    [AnalyticsController::class, 'explain']
    );

    Route::post('/finance-chat', [FinanceChatController::class, 'ask']);

    Route::get(
    '/finance-chat/conversations',
    [FinanceChatController::class, 'conversations']
    );

    Route::post(
    '/finance-chat/actions/create-customer',
    [FinanceChatController::class, 'confirmCustomerAction']
    );

    Route::post(
    '/finance-chat/actions/create-invoice',
    [FinanceChatController::class, 'confirmInvoiceAction']
    );

    Route::post(
    '/finance-chat/actions/send-email',
    [FinanceChatController::class, 'confirmEmailAction']
    );

    Route::get(
        '/finance-chat/conversations/{conversation}',
        [FinanceChatController::class, 'show']
    );

    Route::get(
    '/invoices/export/csv',
    [InvoiceExportController::class, 'export']
    );

    Route::get(
    '/forecast/invoices',
    [ForecastController::class, 'index']
    );

    Route::get(
        '/ml/training/invoices',
        [MlTrainingController::class, 'invoices']
    );

    Route::get(
    '/ml/risk/dataset',
    [MlTrainingController::class, 'dataset']
    );

    Route::post(
    '/ml/risk/train',
    [MlTrainingController::class, 'train']
    );

    Route::get(
    '/ml/risk/invoices/{invoice}/predict',
    [MlTrainingController::class, 'predict']
    );

    Route::post(
    '/ml/risk/compare',
    [
        MlTrainingController::class,
        'compare',
    ]
    );

    Route::get(
    '/ml/risk/intelligence',
    [
        MlTrainingController::class,
        'intelligence',
    ]
    );

    Route::post(
    '/ml/risk/invoices/{invoice}/explain',
    [
        MlTrainingController::class,
        'explain',
    ]
    );

    Route::get(
    '/customer-intelligence',
    [
        CustomerIntelligenceController::class,
        'index',
    ]
    );

    Route::get(
    '/finance-insights',
    [
        FinanceInsightsController::class,
        'index',
    ]
    );

    Route::post(
        '/finance-chat',
        [FinanceChatController::class, 'ask']
    );

    Route::put(
    '/ai-actions/{aiAction}',
    [AiActionController::class, 'update']
    );

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/invoices', [InvoiceController::class, 'index']);
    Route::post('/invoices', [InvoiceController::class, 'store']);

    Route::post('/customers', [CustomerController::class, 'store']);
    Route::get('/customers', [CustomerController::class, 'index']);

    Route::post(
        '/invoices/{invoice}/follow-up',
        [InvoiceController::class, 'generateFollowUp']
    );
    
});