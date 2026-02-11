<?php

namespace App\Http\Controllers;

use App\Models\Section;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SectionController extends Controller
{
    public function index(Request $request)
    {
        $showArchived = $request->get('archived', false);
        
        $sections = Section::when($showArchived, function ($query) {
                return $query->where('is_archive', true);
            }, function ($query) {
                return $query->where('is_archive', false);
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/ManageSections', [
            'sections' => $sections,
            'showArchived' => $showArchived,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:office_assigned,name',
            'description' => 'nullable|string|max:500',
        ]);

        Section::create($validated);

        return redirect()->route('sections.index')
            ->with('success', 'Section created successfully.');
    }

    public function update(Request $request, Section $section)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:office_assigned,name,' . $section->id,
            'description' => 'nullable|string|max:500',
        ]);

        $section->update($validated);

        return redirect()->route('sections.index')
            ->with('success', 'Section updated successfully.');
    }

    public function archive(Section $section)
    {
        $section->update([
            'is_archive' => true,
            'archived_date' => now(),
        ]);

        return redirect()->route('sections.index')
            ->with('success', 'Section archived successfully.');
    }

    public function restore(Section $section)
    {
        $section->update([
            'is_archive' => false,
            'archived_date' => null,
        ]);

        return redirect()->route('sections.index', ['archived' => true])
            ->with('success', 'Section restored successfully.');
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return redirect()->route('sections.index')
            ->with('success', 'Section deleted successfully.');
    }
}
