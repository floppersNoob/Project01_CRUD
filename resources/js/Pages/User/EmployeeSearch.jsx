import React, { useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import UserLayout from '../../Layouts/UserLayout';

export default function EmployeeSearch({ employees, offices, employmentStatuses, positions }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOffice, setSelectedOffice] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedPosition, setSelectedPosition] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
    const [loadingEmployee, setLoadingEmployee] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const debounceRef = useRef(null);
    const searchInputRef = useRef(null);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === '/') {
                e.preventDefault();
                searchInputRef.current?.focus();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => 
                    prev < employees.data.length - 1 ? prev + 1 : prev
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
            } else if (e.key === 'Enter' && selectedIndex >= 0) {
                e.preventDefault();
                const selectedEmployee = employees.data[selectedIndex];
                if (selectedEmployee) {
                    openEmployeeModal(selectedEmployee.id);
                }
            } else if (e.key === 'Escape') {
                setSelectedIndex(-1);
                searchInputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [employees.data, selectedIndex]);

    // Read URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearchTerm(params.get('search') || '');
        setSelectedOffice(params.get('section') || '');
        setSelectedStatus(params.get('status') || '');
        setSelectedPosition(params.get('position') || '');
    }, []);

    // Debounced search / filter effect
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setIsSearching(true);
            const params = new URLSearchParams();
            if (searchTerm) params.set('search', searchTerm);
            if (selectedOffice) params.set('section', selectedOffice);
            if (selectedStatus) params.set('status', selectedStatus);
            if (selectedPosition) params.set('position', selectedPosition);

            router.get(
                `/employee-search?${params.toString()}`,
                {},
                {
                    preserveState: true, // preserves current page
                    preserveScroll: true,
                    replace: true,
                    onFinish: () => setIsSearching(false),
                }
            );
        }, 600);

        return () => clearTimeout(debounceRef.current);
    }, [searchTerm, selectedOffice, selectedStatus, selectedPosition]);

    const toFullName = (emp) =>
        `${emp.first_name} ${emp.middle_name || ''} ${emp.last_name}`.replace(/\s+/g, ' ').trim();

    const highlight = (text, query) => {
        if (!query) return text;
        const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
        return String(text).split(regex).map((part, i) =>
            regex.test(part) ? <mark key={i} className="bg-yellow-100 text-gray-900 rounded-sm">{part}</mark> : <span key={i}>{part}</span>
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedOffice('');
        setSelectedStatus('');
        setSelectedPosition('');
        router.visit('/employee-search', { preserveState: false });
    };

    const goToPage = (page) => {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) params.set('search', searchTerm);
        if (selectedOffice) params.set('section', selectedOffice);
        if (selectedStatus) params.set('status', selectedStatus);
        if (selectedPosition) params.set('position', selectedPosition);
        params.set('page', page);

        router.get(
            `/employee-search?${params.toString()}`,
            {},
            { preserveState: true, preserveScroll: false }
        );
    };

    const openEmployeeModal = async (employeeId) => {
        setLoadingEmployee(true);
        try {
            const response = await fetch(`/employee/${employeeId}`, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setSelectedEmployee(data.employee);
            setEmployeeModalOpen(true);
        } catch (error) {
            console.error('Error fetching employee details:', error);
            alert('Error loading employee details. Please try again.');
        } finally {
            setLoadingEmployee(false);
        }
    };

    const closeEmployeeModal = () => {
        setEmployeeModalOpen(false);
        setSelectedEmployee(null);
    };

    const calculateServiceLength = (employee) => {
        if (!employee.date_started) return 'N/A';

        const start = new Date(employee.date_started);
        const end = employee.date_resigned ? new Date(employee.date_resigned) : new Date();

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months--;
            days += new Date(end.getFullYear(), end.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        const parts = [];
        if (years) parts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months) parts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);

        return parts.length ? parts.join(', ') : '0 days';
    };

    return (
        <UserLayout>
            <div className="max-w-7xl mx-auto px-4 py-10">
                <h1 className="text-3xl font-bold mb-8 text-gray-900">Employee Directory</h1>

                {/* Search + Filters */}
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>}
                    </div>

                    <div className="flex flex-wrap gap-2 md:gap-3 items-center">
                        <select value={selectedOffice} onChange={e => setSelectedOffice(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-700">
                            <option value="">All Offices</option>
                            {offices?.map(office => (
                                <option key={office.id} value={office.id}>{office.name}</option>
                            ))}
                        </select>

                        <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-700">
                            <option value="">All Status</option>
                            {employmentStatuses?.map(status => (
                                <option key={status.id} value={status.id}>{status.name}</option>
                            ))}
                        </select>

                        <select value={selectedPosition} onChange={e => setSelectedPosition(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-700">
                            <option value="">All Positions</option>
                            {positions?.map((position, index) => (
                                <option key={index} value={position}>{position}</option>
                            ))}
                        </select>

                        {/* Clear Filters button always visible */}
                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-[#010066] text-white rounded-lg hover:bg-[#010066]/90 transition-colors font-medium"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>

                {/* Results Summary */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="text-gray-600">
                        {searchTerm ? (
                            <span className="font-medium">
                                Showing {employees?.from || 0}-{employees?.to || 0} of {employees?.total || 0} result{employees?.total !== 1 ? 's' : ''}
                            </span>
                        ) : (
                            <span>
                                Showing {employees?.from || 0}-{employees?.to || 0} of {employees?.total || 0} employee{employees?.total !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>

                {/* Employees Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {employees?.data?.map(emp => (
                        <div
                            key={emp.id}
                            onClick={() => openEmployeeModal(emp.id)}
                            className="flex flex-col bg-white border border-gray-100 rounded-xl shadow hover:shadow-lg transition-shadow p-5 gap-2 cursor-pointer hover:border-[#010066] hover:border-2"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow">
                                    {emp.first_name[0]}{emp.last_name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-900 truncate text-lg">
                                        {highlight(toFullName(emp), searchTerm)}
                                    </h3>
                                    <p className="text-gray-500 text-sm truncate">
                                        {highlight(emp.position || 'No Position', searchTerm)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-sm text-gray-600 truncate">{highlight(emp.office_assigned?.name || 'No Office', searchTerm)}</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${emp.date_resigned || emp.is_archive ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                    {emp.date_resigned ? 'Resigned' : emp.is_archive ? 'Archived' : 'Active'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {employees?.links && (
                    <div className="mt-8">
                        <div className="flex justify-center items-center gap-2">
                            {employees.links.map((link, index) => (
                                <div key={index}>
                                    {link.url ? (
                                        <button
                                            onClick={() => {
                                                let pageNumber;
                                                if (link.label === 'Previous') {
                                                    pageNumber = Math.max(1, employees.current_page - 1);
                                                } else if (link.label === 'Next') {
                                                    pageNumber = Math.min(employees.last_page, employees.current_page + 1);
                                                } else {
                                                    pageNumber = parseInt(link.label);
                                                }
                                                goToPage(pageNumber);
                                            }}
                                            disabled={!link.url}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${link.active ? 'bg-[#010066] text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'} ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span className="px-4 py-2" dangerouslySetInnerHTML={{ __html: link.label }} />
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-4 text-sm text-gray-600">
                            Page {employees?.current_page} of {employees?.last_page}
                        </div>
                    </div>
                )}

                {/* Employee Details Modal */}
                {employeeModalOpen && selectedEmployee && (
                    <div className="fixed inset-0 z-50 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" onClick={closeEmployeeModal}>
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                            <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                                <div className="bg-white">
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-[#010066]">
                                        <h3 className="text-xl font-bold text-white">Employee Details</h3>
                                        <button onClick={closeEmployeeModal} className="text-white hover:text-gray-200">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                    <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                                        {loadingEmployee ? (
                                            <div className="flex justify-center items-center py-20">
                                                <div className="w-8 h-8 border-2 border-[#010066] border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Employee Header */}
                                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-20 h-20 bg-[#010066] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                                            {selectedEmployee.first_name[0]}{selectedEmployee.last_name[0]}
                                                        </div>
                                                        <div className="flex-1">
                                                            <h2 className="text-2xl font-bold text-gray-900">
                                                                {selectedEmployee.first_name} {selectedEmployee.middle_name} {selectedEmployee.last_name}{selectedEmployee.suffix && ', ' + selectedEmployee.suffix}
                                                            </h2>
                                                            <p className="text-gray-600 mt-1">
                                                                {selectedEmployee.position || 'No Position'} • {selectedEmployee.office_assigned?.name || 'No Office'}
                                                            </p>
                                                            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                                                                selectedEmployee.date_resigned || selectedEmployee.is_archive
                                                                    ? 'bg-orange-100 text-orange-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}>
                                                                {selectedEmployee.date_resigned ? 'Resigned' : selectedEmployee.is_archive ? 'Archived' : 'Active'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Employee Information */}
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                    <div className="bg-white rounded-xl p-6 border">
                                                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Personal Information</h3>
                                                        <InfoRow label="First Name" value={selectedEmployee.first_name} />
                                                        <InfoRow label="Middle Name" value={selectedEmployee.middle_name || 'N/A'} />
                                                        <InfoRow label="Last Name" value={selectedEmployee.last_name} />
                                                        <InfoRow label="Suffix" value={selectedEmployee.suffix || 'N/A'} />
                                                    </div>

                                                    <div className="bg-white rounded-xl p-6 border">
                                                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Employment Details</h3>
                                                        <InfoRow label="Position" value={selectedEmployee.position || 'N/A'} />
                                                        <InfoRow label="Department" value={selectedEmployee.office_assigned?.name || 'N/A'} />
                                                        <InfoRow label="Status" value={selectedEmployee.employment_status?.name || 'N/A'} />
                                                        <InfoRow
                                                            label="Date Started"
                                                            value={selectedEmployee.date_started ? new Date(selectedEmployee.date_started).toLocaleDateString() : 'N/A'}
                                                        />
                                                        <InfoRow 
                                                            label="Date of Resigned" 
                                                            value={selectedEmployee.date_resigned ? new Date(selectedEmployee.date_resigned).toLocaleDateString('en-GB', { 
                                                                day: '2-digit', 
                                                                month: '2-digit', 
                                                                year: 'numeric' 
                                                            }) : 'N/A'} 
                                                        />
                                                        <InfoRow label="Length of Service" value={calculateServiceLength(selectedEmployee)} />
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="mt-6 flex justify-end">
                                                    <button
                                                        onClick={closeEmployeeModal}
                                                        className="px-6 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium"
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </UserLayout>
    );
}

/* Helper Components */
const InfoRow = ({ label, value }) => (
    <div className="flex justify-between py-2 text-sm">
        <span className="text-gray-500">{label}:</span>
        <span className="font-medium text-gray-900">{value}</span>
    </div>
);
