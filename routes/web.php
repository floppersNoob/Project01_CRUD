<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\Admin\HistoryController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\SectionController;
use App\Http\Controllers\EmploymentStatusController;
use App\Http\Controllers\User\EmployeeSearchController;
use App\Http\Controllers\User\QuickVerifyController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;


Route::get('/', function () {
    return redirect()->route('login');
});

// Public routes (accessible without authentication)
Route::get('/employee-search', [EmployeeSearchController::class, 'index'])->name('employee.search');
Route::get('/employee/{id}', [EmployeeSearchController::class, 'show'])->name('employee.show');
Route::get('/employee-suggest', [EmployeeSearchController::class, 'suggest'])->name('employee.suggest');
Route::get('/quick-verify', [QuickVerifyController::class, 'index'])->name('quick.verify');
Route::get('/quick-verify/search', [QuickVerifyController::class, 'search'])->name('quick.verify.search');

// Test route to bypass authentication
Route::get('/test', function() {
    return response()->json(['message' => 'Application is working!']);
});

Route::middleware('auth')->group(function () {
    // Admin routes
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    
    // History Management routes
    Route::get('/admin/history', [HistoryController::class, 'index'])->name('admin.history.index');
    Route::get('/admin/history/{type}/{id}', [HistoryController::class, 'show'])->name('admin.history.show');
    Route::get('/admin/history/export', [HistoryController::class, 'export'])->name('admin.history.export');
    Route::post('/admin/resignations', [HistoryController::class, 'store'])->name('admin.resignations.store');
    
    // Employee routes
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::post('/employees/import', [EmployeeController::class, 'import'])->name('employees.import');
    Route::put('/employees/{employee}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::post('/employees/{employee}/archive', [EmployeeController::class, 'archive'])->name('employees.archive');
    Route::post('/employees/{employee}/restore', [EmployeeController::class, 'restore'])->name('employees.restore');
    Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy'])->name('employees.destroy');

    // Section routes
    Route::get('/sections', [SectionController::class, 'index'])->name('sections.index');
    Route::post('/sections', [SectionController::class, 'store'])->name('sections.store');
    Route::put('/sections/{section}', [SectionController::class, 'update'])->name('sections.update');
    Route::post('/sections/{section}/archive', [SectionController::class, 'archive'])->name('sections.archive');
    Route::post('/sections/{section}/restore', [SectionController::class, 'restore'])->name('sections.restore');
    Route::delete('/sections/{section}', [SectionController::class, 'destroy'])->name('sections.destroy');

    // Employment Status routes
    Route::get('/employment-status', [EmploymentStatusController::class, 'index'])->name('employment-status.index');
    Route::post('/employment-status', [EmploymentStatusController::class, 'store'])->name('employment-status.store');
    Route::put('/employment-status/{employmentStatus}', [EmploymentStatusController::class, 'update'])->name('employment-status.update');
    Route::post('/employment-status/{employmentStatus}/archive', [EmploymentStatusController::class, 'archive'])->name('employment-status.archive');
    Route::post('/employment-status/{employmentStatus}/restore', [EmploymentStatusController::class, 'restore'])->name('employment-status.restore');
    Route::delete('/employment-status/{employmentStatus}', [EmploymentStatusController::class, 'destroy'])->name('employment-status.destroy');
});

require __DIR__.'/auth.php';
