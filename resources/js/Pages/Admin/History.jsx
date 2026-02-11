import React, { useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function History({ stats, history, pagination, filters, sections, employmentStatuses, employees }) {
    const [search, setSearch] = useState(filters?.search || '');
    const [dateRange, setDateRange] = useState(filters?.date_range || '');
    const [section, setSection] = useState(filters?.section || '');
    const [showResignationModal, setShowResignationModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resignationFormData, setResignationFormData] = useState({
        employee_id: '',
        resignation_date: '',
        reason: '',
        notes: '',
    });

    const handleClear = () => {
        setSearch('');
        setDateRange('');
        setSection('');
        router.get('/admin/history');
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (dateRange) params.append('date_range', dateRange);
        if (section) params.append('section', section);
        
        router.get(`/admin/history?${params.toString()}`);
    };

    const handleAddResignation = (e) => {
        e.preventDefault();
        
        // Basic validation
        if (!resignationFormData.employee_id) {
            alert('Please select an employee');
            return;
        }
        
        if (!resignationFormData.resignation_date) {
            alert('Please provide a resignation date');
            return;
        }
        
        if (!resignationFormData.reason) {
            alert('Please provide a resignation reason');
            return;
        }
        
        setIsSubmitting(true);
        
        router.post('/admin/resignations', resignationFormData, {
            onSuccess: (page) => {
                setShowResignationModal(false);
                setResignationFormData({
                    employee_id: '',
                    resignation_date: '',
                    reason: '',
                    notes: '',
                });
                setIsSubmitting(false);
                router.reload(); // Refresh the page to show updated history
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                setIsSubmitting(false);
                alert('Failed to add resignation record. Please check the form and try again.');
            }
        });
    };

    const openResignationModal = () => {
        setShowResignationModal(true);
        setResignationFormData({
            employee_id: '',
            resignation_date: '',
            reason: '',
            notes: '',
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Present';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Invalid Date';
            }
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            console.warn('Date formatting error:', error, 'for date:', dateString);
            return 'Invalid Date';
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Employee Resignation History</h1>
                        <p className="text-sm text-gray-500 mt-1">View and manage employee resignation records</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={openResignationModal}
                            className="flex items-center px-4 py-2 bg-[#EB3505] text-white rounded-lg hover:bg-[#EB3505]/80 transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Add Resignation
                        </button>
                    </div>
                </div>

                {/* Resignation Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-orange-50 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 text-sm font-medium">Total Resignations</p>
                                <p className="text-3xl font-bold text-orange-900 mt-2">{stats?.totalResignations || 0}</p>
                                <p className="text-orange-100 text-xs mt-2">All resignation records</p>
                            </div>
                            <div className="bg-orange-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-600 text-sm font-medium">This Month</p>
                                <p className="text-3xl font-bold text-red-900 mt-2">{stats?.thisMonthResignations || 0}</p>
                                <p className="text-red-100 text-xs mt-2">Resignations this month</p>
                            </div>
                            <div className="bg-red-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm font-medium">Inactive Employees</p>
                                <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.inactiveEmployees || 0}</p>
                                <p className="text-gray-100 text-xs mt-2">Currently inactive</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Search & Filter</h3>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-1">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Search Employee</label>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name..."
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066] text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <select 
                                    value={section}
                                    onChange={(e) => setSection(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066] text-sm"
                                >
                                    <option value="">All Sections</option>
                                    {sections?.map((section) => (
                                        <option key={section.id} value={section.id}>
                                            {section.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                                <select 
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="w-full px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066] text-sm"
                                >
                                    <option value="">All Time</option>
                                    <option value="7">Last 7 Days</option>
                                    <option value="30">Last 30 Days</option>
                                    <option value="90">Last 90 Days</option>
                                    <option value="365">Last Year</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleSearch}
                                className="px-2 py-1 bg-[#010066] text-white rounded-lg hover:bg-[#010066]/80 transition-colors whitespace-nowrap text-sm"
                            >
                                Search
                            </button>
                            <button 
                                onClick={handleClear}
                                className="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors whitespace-nowrap text-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                </div>

                {/* Resignation Records Table */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Resignation Records</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resignation Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {history && history.length > 0 ? (
                                    history.map((record) => (
                                        <tr key={`resignation-${record.id}`}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                                                            <span className="text-sm font-medium text-red-600">
                                                                {record.employee?.first_name && record.employee?.last_name ? 
                                                                    `${record.employee.first_name} ${record.employee.last_name}`.split(' ').filter(n => n).map(n => n[0]).join('').toUpperCase() : 
                                                                    'N/A'
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {record.employee?.first_name && record.employee?.last_name ? 
                                                                `${record.employee.first_name} ${record.employee.last_name}` : 
                                                                'Unknown Employee'
                                                            }
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {record.employee?.position || 'No Position'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">
                                                    {record.employee?.section?.name || 'No Section'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-900">
                                                    {formatDate(record.resignation_date)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-900 truncate max-w-xs block">
                                                    {record.reason || 'No reason provided'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                    Inactive
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button 
                                                    onClick={() => router.visit(`/admin/history/resignation/${record.id}`)}
                                                    className="text-[#010066] hover:text-[#010066]/80 mr-3"
                                                >
                                                    View
                                                </button>
                                                <button className="text-[#EB3505] hover:text-[#EB3505]/80">Edit</button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center">
                                                <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                <p>No resignation records found</p>
                                                <p className="text-sm text-gray-400 mt-1">Resignation records will appear here once data is added</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="mt-6 flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to{' '}
                                <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of{' '}
                                <span className="font-medium">{pagination.total}</span> results
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search) params.append('search', search);
                                        if (dateRange) params.append('date_range', dateRange);
                                        if (status) params.append('status', status);
                                        if (section) params.append('section', section);
                                        if (pagination.current_page > 1) params.append('page', pagination.current_page - 1);
                                        router.get(`/admin/history?${params.toString()}`);
                                    }}
                                    disabled={pagination.current_page <= 1}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white">
                                    {pagination.current_page}
                                </span>
                                <button 
                                    onClick={() => {
                                        const params = new URLSearchParams();
                                        if (search) params.append('search', search);
                                        if (dateRange) params.append('date_range', dateRange);
                                        if (status) params.append('status', status);
                                        if (section) params.append('section', section);
                                        params.append('page', pagination.current_page + 1);
                                        router.get(`/admin/history?${params.toString()}`);
                                    }}
                                    disabled={pagination.current_page >= pagination.last_page}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Resignation Modal */}
            {showResignationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Resignation Record</h3>
                        <form onSubmit={handleAddResignation} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
                                <select
                                    value={resignationFormData.employee_id}
                                    onChange={(e) => setResignationFormData({ ...resignationFormData, employee_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                    required
                                >
                                    <option value="">Select Employee</option>
                                    {employees && employees.length > 0 ? (
                                        employees.map((employee) => (
                                            <option key={employee.id} value={employee.id}>
                                                {employee.first_name} {employee.last_name}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No employees available</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Resignation Date *</label>
                                <input
                                    type="date"
                                    value={resignationFormData.resignation_date}
                                    onChange={(e) => setResignationFormData({ ...resignationFormData, resignation_date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                                <textarea
                                    value={resignationFormData.reason}
                                    onChange={(e) => setResignationFormData({ ...resignationFormData, reason: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                    rows="3"
                                    placeholder="Reason for resignation..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={resignationFormData.notes}
                                    onChange={(e) => setResignationFormData({ ...resignationFormData, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                    rows="2"
                                    placeholder="Additional notes or comments..."
                                />
                            </div>
                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowResignationModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-[#EB3505] text-white rounded-lg hover:bg-[#EB3505]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Adding...' : 'Add Resignation'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
