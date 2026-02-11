<?php

namespace App\Http\Controllers;

use App\Models\EmploymentStatus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EmploymentStatusController extends Controller
{
    public function index(Request $request)
    {
        $showArchived = $request->get('archived', false);
        
        $employmentStatuses = EmploymentStatus::when($showArchived, function ($query) {
                return $query->where('is_archive', true);
            }, function ($query) {
                return $query->where('is_archive', false);
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/ManageStatus', [
            'employmentStatuses' => $employmentStatuses,
            'showArchived' => $showArchived,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:employment_statuses,name',
            'description' => 'nullable|string|max:500',
        ]);

        EmploymentStatus::create($validated);

        return redirect()->route('employment-status.index')
            ->with('success', 'Employment status created successfully.');
    }

    public function update(Request $request, EmploymentStatus $employmentStatus)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:employment_statuses,name,' . $employmentStatus->id,
            'description' => 'nullable|string|max:500',
        ]);

        $employmentStatus->update($validated);

        return redirect()->route('employment-status.index')
            ->with('success', 'Employment status updated successfully.');
    }

    public function archive(EmploymentStatus $employmentStatus)
    {
        $employmentStatus->update([
            'is_archive' => true,
            'archived_date' => now(),
        ]);

        return redirect()->route('employment-status.index')
            ->with('success', 'Employment status archived successfully.');
    }

    public function restore(EmploymentStatus $employmentStatus)
    {
        $employmentStatus->update([
            'is_archive' => false,
            'archived_date' => null,
        ]);

        return redirect()->route('employment-status.index', ['archived' => true])
            ->with('success', 'Employment status restored successfully.');
    }

    public function destroy(EmploymentStatus $employmentStatus)
    {
        $employmentStatus->delete();

        return redirect()->route('employment-status.index')
            ->with('success', 'Employment status deleted successfully.');
    }
}
