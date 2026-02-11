import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';
import * as XLSX from 'xlsx';

export default function EmployeeIndex({ employees, showArchived, sections, employmentStatuses, positions }) {
    // Initialize filters from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters = {
        search: urlParams.get('search') || '',
        section: urlParams.get('section') || '',
        status: urlParams.get('status') || '',
        position: urlParams.get('position') || ''
    };

    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [resetRecords, setResetRecords] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search);
    const [selectedOffice, setSelectedOffice] = useState(initialFilters.section);
    const [selectedStatus, setSelectedStatus] = useState(initialFilters.status);
    const [selectedPosition, setSelectedPosition] = useState(initialFilters.position);
    const [filters, setFilters] = useState(initialFilters);
    const [isImporting, setIsImporting] = useState(false);
    const [customAlert, setCustomAlert] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState(new Set());
    const [selectAll, setSelectAll] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        sex: '',
        position: '',
        office_assigned_id: '',
        employment_status_id: '',
        date_started: null,
        date_resigned: null,
    });

    // Custom Alert Functions
    const showSuccessAlert = (title, message) => {
        setCustomAlert({
            type: 'success',
            title,
            message,
            icon: '✓'
        });
        setTimeout(() => setCustomAlert(null), 3000);
    };

    const showErrorAlert = (title, message) => {
        setCustomAlert({
            type: 'error',
            title,
            message,
            icon: '✕'
        });
        setTimeout(() => setCustomAlert(null), 4000);
    };

    const showInfoAlert = (title, message) => {
        setCustomAlert({
            type: 'info',
            title,
            message,
            icon: 'ℹ'
        });
        setTimeout(() => setCustomAlert(null), 3000);
    };

    const showConfirmAlert = (title, message, options = {}) => {
        return new Promise((resolve) => {
            setCustomAlert({
                type: 'warning',
                title,
                message,
                icon: '⚠',
                showConfirmButton: true,
                confirmButtonText: options.confirmButtonText || 'Yes',
                cancelButtonText: options.cancelButtonText || 'No',
                showCancelButton: true,
                timer: 0,
                allowOutsideClick: false,
                onConfirm: () => {
                    setCustomAlert(null);
                    resolve(true);
                },
                onCancel: () => {
                    setCustomAlert(null);
                    resolve(false);
                }
            });
        });
    };

    // Modal Feedback Functions
    const handleCloseAddModal = () => {
        setShowAddModal(false);
        setFormData({
            first_name: '',
            middle_name: '',
            last_name: '',
            office_assigned_id: '',
            employment_status_id: '',
            date_started: null,
            date_resigned: null,
        });
        showInfoAlert('Cancelled', 'Add employee form has been cancelled.');
    };

    const handleOpenAddModal = () => {
        setFormData({
            first_name: '',
            middle_name: '',
            last_name: '',
            office_assigned_id: '',
            employment_status_id: '',
            date_started: null,
            date_resigned: null,
        });
        setShowAddModal(true);
    };

    const handleAddEmployee = (e) => {
        e.preventDefault();
        if (!validateForm(formData)) {
            return;
        }

        router.post('/employees', formData, {
            onSuccess: () => {
                setShowAddModal(false);
                setFormData({
                    first_name: '',
                    middle_name: '',
                    last_name: '',
                    suffix: '',
                    sex: '',
                    position: '',
                    office_assigned_id: '',
                    employment_status_id: '',
                    date_started: null,
                    date_resigned: null,
                });
                showSuccessAlert('Success!', 'Employee added successfully!');
                setTimeout(() => {
                    router.visit(window.location.href);
                }, 1500);
            },
            onError: (errors) => {
                showErrorAlert('Error', 'Failed to add employee. Please check the form and try again.');
            }
        });
    };

    const handleCloseEditModal = () => {
        setShowEditModal(false);
        setEditingEmployee(null);
        showInfoAlert('Cancelled', 'Edit employee form has been cancelled.');
    };

    const validateForm = (data) => {
        if (!data.first_name.trim()) {
            showErrorAlert('Validation Error', 'First name is required.');
            return false;
        }
        if (!data.last_name.trim()) {
            showErrorAlert('Validation Error', 'Last name is required.');
            return false;
        }
        if (!data.office_assigned_id) {
            showErrorAlert('Validation Error', 'Please select an office.');
            return false;
        }
        if (!data.employment_status_id) {
            showErrorAlert('Validation Error', 'Please select an employment status.');
            return false;
        }
        return true;
    };

    // Handle filter changes
    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);

        // Build URL with filter parameters
        const params = new URLSearchParams();
        if (newFilters.search) params.append('search', newFilters.search);
        if (newFilters.section) params.append('section', newFilters.section);
        if (newFilters.status) params.append('status', newFilters.status);
        if (newFilters.position) params.append('position', newFilters.position);
        if (showArchived) params.append('archived', 'true');

        const url = `/employees${params.toString() ? '?' + params.toString() : ''}`;
        router.visit(url, {
            preserveScroll: true,
            onSuccess: () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    // Handle pagination
    const handlePageChange = (url) => {
        // Preserve current filters in pagination
        const urlObj = new URL(url, window.location.origin);
        if (filters.search) urlObj.searchParams.set('search', filters.search);
        if (filters.section) urlObj.searchParams.set('section', filters.section);
        if (filters.status) urlObj.searchParams.set('status', filters.status);
        if (filters.position) urlObj.searchParams.set('position', filters.position);
        if (showArchived) urlObj.searchParams.set('archived', 'true');

        router.visit(urlObj.toString(), {
            preserveScroll: true,
            onSuccess: () => {
                // Scroll to top of table
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    };

    const handleImportData = () => {
        setShowImportModal(true);
    };

    const handleFileSelect = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.xlsx';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            setShowImportModal(false);
            setIsImporting(true);

            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];

                    let jsonData;
                    try {
                        jsonData = XLSX.utils.sheet_to_json(worksheet, {
                            header: 1,
                            defval: '',
                            blankrows: false
                        });

                        if (jsonData.length > 0) {
                            const headers = jsonData[0];
                            const rows = jsonData.slice(1);

                            jsonData = rows.map(row => {
                                const obj = {};
                                headers.forEach((header, index) => {
                                    const cleanHeader = header ? header.toString().trim() : '';
                                    obj[cleanHeader] = row[index] || '';
                                });
                                return obj;
                            });
                        }
                    } catch {
                        jsonData = XLSX.utils.sheet_to_json(worksheet);
                    }

                    const employees = jsonData.map(row => {
                        // Normalize column names by trimming whitespace
                        const normalizedRow = {};
                        Object.keys(row).forEach(key => {
                            const cleanKey = key ? key.toString().trim() : '';
                            normalizedRow[cleanKey] = row[key];
                        });
                        
                        // Find the date column (handles the long column name)
                        const dateStartedKey = Object.keys(normalizedRow).find(key => 
                            key.toLowerCase().includes('date') && 
                            key.toLowerCase().includes('first') &&
                            key.toLowerCase().includes('issuance')
                        );
                        
                        // Convert Excel date serial number to JS Date if needed
                        let dateStarted = null;
                        if (dateStartedKey && normalizedRow[dateStartedKey]) {
                            const dateValue = normalizedRow[dateStartedKey];
                            if (typeof dateValue === 'number') {
                                // Excel date serial number (days since 1900-01-01)
                                const excelEpoch = new Date(1900, 0, 1);
                                const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
                                // Fix Excel 1900 leap year bug
                                if (dateValue > 60) {
                                    date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
                                }
                                dateStarted = date.toISOString().split('T')[0];
                            } else if (dateValue instanceof Date) {
                                dateStarted = dateValue.toISOString().split('T')[0];
                            } else {
                                // Try parsing string date (DD/MM/YYYY format)
                                const dateStr = dateValue.toString().trim();
                                const parts = dateStr.split('/');
                                if (parts.length === 3) {
                                    const day = parts[0].padStart(2, '0');
                                    const month = parts[1].padStart(2, '0');
                                    const year = parts[2];
                                    dateStarted = `${year}-${month}-${day}`;
                                } else {
                                    dateStarted = dateStr;
                                }
                            }
                        }
                        
                        return {
                            first_name: normalizedRow['NAME']?.trim() || normalizedRow['Name']?.trim() || '',
                            middle_name: normalizedRow['MIDDLE NAME']?.trim() || normalizedRow['Middle Name']?.trim() || '',
                            last_name: normalizedRow['SURNAME']?.trim() || normalizedRow['Surname']?.trim() || '',
                            OFFICE: normalizedRow['OFFICE']?.trim() || normalizedRow['Office']?.trim() || '',
                            position: normalizedRow['POSITION TITLE']?.trim() || normalizedRow['Position Title']?.trim() || '',
                            suffix: normalizedRow['SUFFIX']?.trim() || normalizedRow['Suffix']?.trim() || '',
                            sex: normalizedRow['SEX']?.trim() || normalizedRow['Sex']?.trim() || '',
                            employment_status: normalizedRow['EMPLOYMENT STATUS']?.trim() || 
                                               normalizedRow['Employment Status']?.trim() || 
                                               normalizedRow['EMPLOYMENTSTATUS']?.trim() || '',
                            date_started: dateStarted,
                            date_resigned: null,
                            contract_type: 'Regular'
                        };
                    });

                    const validEmployees = employees.filter(e => e.first_name);

                    if (!validEmployees.length) {
                        showErrorAlert('Import Error', 'No valid employee data found. Please check your Excel file.');
                        setIsImporting(false);
                        return;
                    }

                    router.post('/employees/import', {
                        employees: validEmployees,
                        reset: resetRecords
                    }, {
                        onSuccess: (page) => {
                            setIsImporting(false);
                            setShowImportModal(false);
                            showSuccessAlert('Import Successful', `Successfully imported ${validEmployees.length} employees!`);
                            router.reload();
                        },
                        onError: (errors) => {
                            setIsImporting(false);
                            setShowImportModal(false);
                            const errorMessage = errors?.message || errors?.error || 'Please check the file format.';
                            showErrorAlert('Import Failed', errorMessage);
                        },
                        onFinish: () => {
                            // Always reset loading state when request completes
                            setIsImporting(false);
                        }
                    });

                } catch (error) {
                    console.error(error);
                    setIsImporting(false);
                    showErrorAlert('Error', 'Error processing file. Please try again.');
                }
            };

            reader.readAsArrayBuffer(file);
        };

        input.click();
    };


    const handleEditEmployee = (employee) => {
        setEditingEmployee(employee);
        
        // Format dates for HTML date inputs (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
        };
        
        setFormData({
            first_name: employee.first_name,
            middle_name: employee.middle_name || '',
            last_name: employee.last_name,
            suffix: employee.suffix || '',
            sex: employee.sex || '',
            position: employee.position || '',
            office_assigned_id: employee.office_assigned_id,
            employment_status_id: employee.employment_status_id,
            date_started: formatDateForInput(employee.date_started),
            date_resigned: formatDateForInput(employee.date_resigned),
        });
        setShowEditModal(true);
    };

    const handleUpdateEmployee = () => {
        if (!validateForm(formData)) {
            return;
        }

        router.put(`/employees/${editingEmployee.id}`, formData, {
            onSuccess: () => {
                setShowEditModal(false);
                setEditingEmployee(null);
                showSuccessAlert('Success!', 'Employee updated successfully!');
                setTimeout(() => {
                    router.visit(window.location.href); // Force full page reload
                }, 1500);
            },
            onError: (errors) => {
                showErrorAlert('Error', 'Failed to update employee. Please check the form and try again.');
            }
        });
    };

    const handleArchive = (employee) => {
        // Check archivability status from backend
        const archivability = employee.archivability_status;
        
        if (archivability?.status === 'active') {
            // Show error alert - cannot archive active employee
            showErrorAlert('Cannot Archive Active Employee', archivability.message);
            return;
        }
        
        if (archivability?.status === 'archived') {
            // Show error alert - already archived
            showErrorAlert('Already Archived', archivability.message);
            return;
        }

        // Create a timeout to force clear loading state if it gets stuck
        const loadingTimeout = setTimeout(() => {
            setIsProcessing(false);
        }, 3000); // 3 second timeout

        // Show confirmation for archivable employees
        showConfirmAlert(
            'Archive Employee',
            `Are you sure you want to archive "${employee.first_name} ${employee.last_name}"?`,
            {
                confirmButtonText: 'Yes, Archive',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                timer: 0,
                allowOutsideClick: false
            }
        ).then((result) => {
            if (result) {
                // Show loading effect and proceed with archive
                setIsProcessing(true);
                setProcessingMessage(`Archiving "${employee.first_name} ${employee.last_name}"...`);

                router.post(`/employees/${employee.id}/archive`, {
                    onSuccess: (page) => {
                        // Clear the timeout since operation completed
                        clearTimeout(loadingTimeout);

                        // Clear loading state immediately
                        setIsProcessing(false);
                        showSuccessAlert('Success!', 'Employee archived successfully!');

                        // Force navigation after a short delay
                        setTimeout(() => {
                            router.visit(window.location.href);
                        }, 300);
                    },
                    onError: (errors) => {
                        // Clear the timeout since operation completed
                        clearTimeout(loadingTimeout);

                        // Clear loading state immediately
                        setIsProcessing(false);
                        
                        // Check if it's a validation error about active employee
                        if (errors.props?.errors?.error && errors.props.errors.error.includes('Must be resigned first')) {
                            showErrorAlert('Cannot Archive Active Employee', 'You cannot archive an active employee. They must resign first before they can be archived.');
                        } else {
                            showErrorAlert('Error', 'Failed to archive employee.');
                        }
                    },
                    onFinish: () => {
                        // Clear the timeout since operation completed
                        clearTimeout(loadingTimeout);
                    }
                });
            } else {
                // User cancelled, clear the timeout
                clearTimeout(loadingTimeout);
            }
        });
    };

    const handleRestore = (employee) => {
        showConfirmAlert(
            'Restore Employee',
            `Are you sure you want to restore "${employee.first_name} ${employee.last_name}"?`,
            {
                confirmButtonText: 'Yes, Restore',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                timer: 0,
                allowOutsideClick: false
            }
        ).then((result) => {
            if (result) {
                // Create a timeout to force clear loading state if it gets stuck
                const loadingTimeout = setTimeout(() => {
                    setIsProcessing(false);
                }, 3000); // 3 second timeout

                setIsProcessing(true);
                setProcessingMessage(`Restoring "${employee.first_name} ${employee.last_name}"...`);

                router.post(`/employees/${employee.id}/restore`, {
                    onSuccess: () => {
                        // Clear the timeout since operation completed
                        clearTimeout(loadingTimeout);

                        setIsProcessing(false);
                        showSuccessAlert('Success!', 'Employee restored successfully!');
                        // Small delay to ensure success alert shows before navigation
                        setTimeout(() => {
                            router.visit(window.location.href);
                        }, 300);
                    },
                    onError: () => {
                        clearTimeout(loadingTimeout);

                        setIsProcessing(false);
                        showErrorAlert('Error', 'Failed to restore employee.');
                    },
                    onFinish: () => {
                        clearTimeout(loadingTimeout);

                        // Ensure loading state is always cleared
                        setIsProcessing(false);
                    }
                });
            }
        });
    };

    // Checkbox handlers
    const handleSelectEmployee = (employeeId) => {
        const newSelected = new Set(selectedEmployees);
        if (newSelected.has(employeeId)) {
            newSelected.delete(employeeId);
        } else {
            newSelected.add(employeeId);
        }
        setSelectedEmployees(newSelected);

        // Update select all checkbox state
        setSelectAll(newSelected.size === employees.data.length && employees.data.length > 0);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedEmployees(new Set());
        } else {
            const allIds = new Set(employees.data.map(emp => emp.id));
            setSelectedEmployees(allIds);
        }
        setSelectAll(!selectAll);
    };

    const handleBulkRestore = () => {
        if (selectedEmployees.size === 0) {
            showErrorAlert('No Selection', 'Please select at least one employee to restore.');
            return;
        }

        showConfirmAlert(
            'Bulk Restore Employees',
            `Are you sure you want to restore ${selectedEmployees.size} employee(s)?`,
            {
                confirmButtonText: 'Yes, Restore All',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                timer: 0,
                allowOutsideClick: false
            }
        ).then((result) => {
            if (result) {
                // Create a timeout to force clear loading state if it gets stuck
                const loadingTimeout = setTimeout(() => {
                    setIsProcessing(false);
                }, 5000); // 5 second timeout for bulk operations

                setIsProcessing(true);
                setProcessingMessage(`Restoring ${selectedEmployees.size} employee(s)...`);

                router.post('/employees/bulk-restore', {
                    employee_ids: Array.from(selectedEmployees)
                }, {
                    onSuccess: () => {
                        // Clear the timeout since operation completed
                        clearTimeout(loadingTimeout);

                        setIsProcessing(false);
                        showSuccessAlert('Success!', `${selectedEmployees.size} employee(s) restored successfully!`);
                        setSelectedEmployees(new Set());
                        setSelectAll(false);

                        // Force navigation after a short delay
                        setTimeout(() => {
                            router.visit(window.location.href);
                        }, 300);
                    },
                    onError: () => {
                        // Clear the timeout since operation completed
                        clearTimeout(loadingTimeout);

                        setIsProcessing(false);
                        showErrorAlert('Error', 'Failed to restore some employees.');
                    },
                    onFinish: () => {
                        // Clear the timeout since operation completed
                        clearTimeout(loadingTimeout);

                        // Ensure loading state is always cleared
                        setIsProcessing(false);
                    }
                });
            }
        });
    };

    const handleDelete = (employee) => {
        showConfirmAlert(
            'Delete Employee',
            `Are you sure you want to delete "${employee.first_name} ${employee.last_name}"? This action cannot be undone.`,
            {
                confirmButtonText: 'Yes, Delete',
                cancelButtonText: 'Cancel',
                showCancelButton: true,
                timer: 0,
                allowOutsideClick: false
            }
        ).then((result) => {
            if (result) {
                setIsProcessing(true);
                setProcessingMessage(`Deleting "${employee.first_name} ${employee.last_name}"...`);

                router.delete(`/employees/${employee.id}`, {
                    onSuccess: () => {
                        setIsProcessing(false);
                        showSuccessAlert('Success!', 'Employee deleted successfully!');
                        setTimeout(() => {
                            router.visit(window.location.href);
                        }, 500);
                    },
                    onError: () => {
                        setIsProcessing(false);
                        showErrorAlert('Error', 'Failed to delete employee.');
                    },
                    onFinish: () => {
                        setIsProcessing(false);
                    }
                });
            }
        });
    };

    const toggleArchived = () => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.section) params.append('section', filters.section);
        if (filters.status) params.append('status', filters.status);
        if (filters.position) params.append('position', filters.position);
        if (!showArchived) params.append('archived', 'true');

        const url = `/employees${params.toString() ? '?' + params.toString() : ''}`;
        router.visit(url);
    };

    return (
        <AdminLayout>
            {/* Custom Styles for Modern Minimal DPWH Animations */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                @keyframes dpwh-glow {
                    0%, 100% { box-shadow: 0 0 15px rgba(1, 0, 102, 0.3); }
                    50% { box-shadow: 0 0 25px rgba(235, 53, 5, 0.6); }
                }
                @keyframes circle-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes circle-pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.1); }
                }
                @keyframes logo-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(1, 0, 102, 0.4); }
                    50% { box-shadow: 0 0 30px rgba(235, 53, 5, 0.6); }
                }
                .animate-circle-rotate {
                    animation: circle-rotate 3s linear infinite;
                }
                .animate-circle-rotate-reverse {
                    animation: circle-rotate 2s linear infinite reverse;
                }
                .animate-circle-pulse {
                    animation: circle-pulse 2s ease-in-out infinite;
                }
                .animate-logo-glow {
                    animation: logo-glow 3s ease-in-out infinite;
                }
                .animate-shimmer {
                    animation: shimmer 2.5s infinite;
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-dpwh-glow {
                    animation: dpwh-glow 3s ease-in-out infinite;
                }
                .animate-minimal-pulse {
                    animation: circle-pulse 2s ease-in-out infinite;
                }
                .animate-line-draw {
                    animation: line-draw 2s ease-in-out infinite;
                }
            `}</style>

            <div className="space-y-6">
                {/* Import Loading Overlay */}
                {isImporting && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-10 flex flex-col items-center max-w-sm mx-4 shadow-xl border border-blue-100 animate-float">
                            {/* DPWH Logo with Circular Loading */}
                            <div className="relative mb-8">
                                {/* Outer rotating circle */}
                                <div className="absolute inset-0 w-20 h-20 animate-circle-rotate">
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#EB3505] rounded-full"></div>
                                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 bg-[#010066] rounded-full"></div>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#EB3505] rounded-full"></div>
                                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 bg-[#010066] rounded-full"></div>
                                </div>

                                {/* Middle rotating circle (reverse) */}
                                <div className="absolute inset-0 w-20 h-20 animate-circle-rotate-reverse">
                                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#010066] rounded-full animate-circle-pulse"></div>
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-circle-pulse" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-circle-pulse" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#010066] rounded-full animate-circle-pulse" style={{ animationDelay: '1.5s' }}></div>
                                </div>

                                {/* DPWH Logo Center */}
                                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center animate-logo-glow border-2 border-[#010066]">
                                    <img
                                        src="/assets/images/DPWH_logo.png"
                                        alt="DPWH Logo"
                                        className="w-12 h-12 object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="hidden items-center justify-center text-center" style={{ display: 'none' }}>
                                        <div className="text-[#010066] font-bold text-xs leading-tight">DPWH</div>
                                        <div className="w-8 h-0.5 bg-[#EB3505] mx-auto mt-1 animate-circle-pulse"></div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Importing Records</h3>
                            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                                Please wait...
                            </p>

                            {/* Minimal Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-3">
                                <div className="h-full bg-gradient-to-r from-[#010066] to-[#EB3505] rounded-full animate-shimmer relative">
                                    <div className="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
                                </div>
                            </div>

                            {/* Minimal Loading Dots */}
                            <div className="flex space-x-2 justify-center">
                                <div className="w-1.5 h-1.5 bg-[#010066] rounded-full animate-minimal-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-minimal-pulse" style={{ animationDelay: '0.3s' }}></div>
                                <div className="w-1.5 h-1.5 bg-[#010066] rounded-full animate-minimal-pulse" style={{ animationDelay: '0.6s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Processing Loading Overlay */}
                {isProcessing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] backdrop-blur-sm">
                        <div className="bg-white rounded-2xl p-10 flex flex-col items-center max-w-sm mx-4 shadow-xl border border-blue-100 animate-float">
                            {/* DPWH Logo with Circular Loading */}
                            <div className="relative mb-8">
                                {/* Outer rotating circle */}
                                <div className="absolute inset-0 w-20 h-20 animate-circle-rotate">
                                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#EB3505] rounded-full"></div>
                                    <div className="absolute top-1/2 right-0 transform -translate-y-1/2 w-2 h-2 bg-[#010066] rounded-full"></div>
                                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#EB3505] rounded-full"></div>
                                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-2 h-2 bg-[#010066] rounded-full"></div>
                                </div>

                                {/* Middle rotating circle (reverse) */}
                                <div className="absolute inset-0 w-20 h-20 animate-circle-rotate-reverse">
                                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#010066] rounded-full animate-circle-pulse"></div>
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-circle-pulse" style={{ animationDelay: '0.5s' }}></div>
                                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-circle-pulse" style={{ animationDelay: '1s' }}></div>
                                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#010066] rounded-full animate-circle-pulse" style={{ animationDelay: '1.5s' }}></div>
                                </div>

                                {/* DPWH Logo Center */}
                                <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center animate-logo-glow border-2 border-[#010066]">
                                    <img
                                        src="/assets/images/DPWH_logo.png"
                                        alt="DPWH Logo"
                                        className="w-12 h-12 object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="hidden items-center justify-center text-center">
                                        <div className="text-[#010066] font-bold text-xs leading-tight">DPWH</div>
                                        <div className="w-8 h-0.5 bg-[#EB3505] mx-auto mt-1"></div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Processing Data</h3>
                            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
                                {processingMessage}
                            </p>

                            {/* Modern Progress Bar */}
                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden mb-3">
                                <div className="h-full bg-gradient-to-r from-[#010066] to-[#EB3505] rounded-full animate-shimmer relative">
                                    <div className="absolute inset-0 bg-white opacity-20 animate-shimmer"></div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mb-6">Please wait...</p>

                            {/* Minimal Loading Dots */}
                            <div className="flex space-x-2 justify-center">
                                <div className="w-1.5 h-1.5 bg-[#010066] rounded-full animate-minimal-pulse"></div>
                                <div className="w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-minimal-pulse" style={{ animationDelay: '0.3s' }}></div>
                                <div className="w-1.5 h-1.5 bg-[#010066] rounded-full animate-minimal-pulse" style={{ animationDelay: '0.6s' }}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Alert Modal */}
                {customAlert && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] backdrop-blur-sm"
                        onClick={() => customAlert.allowOutsideClick && setCustomAlert(null)}
                    >
                        <div
                            className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-sm mx-4 shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 animate-float"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Alert Icon */}
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${customAlert.type === 'success' ? 'bg-green-100' :
                                customAlert.type === 'error' ? 'bg-red-100' :
                                    customAlert.type === 'warning' ? 'bg-yellow-100' :
                                        'bg-blue-100'
                                }`}>
                                <div className={`text-2xl font-bold ${customAlert.type === 'success' ? 'text-green-600' :
                                    customAlert.type === 'error' ? 'text-red-600' :
                                        customAlert.type === 'warning' ? 'text-yellow-600' :
                                            'text-blue-600'
                                    }`}>
                                    {customAlert.icon}
                                </div>
                            </div>

                            {/* Alert Content */}
                            <h3 className={`text-lg font-semibold mb-2 ${customAlert.type === 'success' ? 'text-green-800' :
                                customAlert.type === 'error' ? 'text-red-800' :
                                    customAlert.type === 'warning' ? 'text-yellow-800' :
                                        'text-blue-800'
                                }`}>
                                {customAlert.title}
                            </h3>
                            <p className="text-sm text-gray-600 text-center mb-6 leading-relaxed">
                                {customAlert.message}
                            </p>

                            {/* Alert Buttons */}
                            <div className="flex space-x-3">
                                {customAlert.showCancelButton && (
                                    <button
                                        onClick={() => {
                                            setCustomAlert(null);
                                            if (customAlert.onCancel) customAlert.onCancel();
                                        }}
                                        className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-medium text-sm transition-colors hover:bg-gray-400"
                                    >
                                        {customAlert.cancelButtonText}
                                    </button>
                                )}
                                {customAlert.showConfirmButton && (
                                    <button
                                        onClick={() => {
                                            setCustomAlert(null);
                                            if (customAlert.onConfirm) customAlert.onConfirm();
                                        }}
                                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${customAlert.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                                            customAlert.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                                                customAlert.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                                                    'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        {customAlert.confirmButtonText}
                                    </button>
                                )}
                                {!customAlert.showConfirmButton && !customAlert.showCancelButton && (
                                    <button
                                        onClick={() => setCustomAlert(null)}
                                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${customAlert.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                                            customAlert.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                                                customAlert.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                                                    'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                    >
                                        OK
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Page Header with Actions */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage employee records and information</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={handleImportData}
                            disabled={isImporting}
                            className={`flex items-center px-5 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm ${isImporting
                                ? 'bg-[#010066] text-white cursor-not-allowed opacity-75'
                                : 'bg-[#010066] text-white hover:bg-[#010066]/90 hover:shadow-md active:scale-95'
                                }`}
                        >
                            {isImporting ? (
                                <>
                                    <div className="flex space-x-1 mr-2">
                                        <div className="w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-minimal-pulse"></div>
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-minimal-pulse" style={{ animationDelay: '0.2s' }}></div>
                                        <div className="w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-minimal-pulse" style={{ animationDelay: '0.4s' }}></div>
                                    </div>
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    Import Data
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleOpenAddModal}
                            className="px-4 py-2 bg-[#010066] text-white rounded-lg hover:bg-[#010066]/80 transition-colors"
                        >
                            Add Employee
                        </button>
                    </div>
                </div>

                {/* Pill Tab Buttons */}
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (filters.search) params.append('search', filters.search);
                                if (filters.section) params.append('section', filters.section);
                                if (filters.status) params.append('status', filters.status);

                                const url = `/employees${params.toString() ? '?' + params.toString() : ''}`;
                                router.visit(url);
                            }}
                            className={`px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-in-out transform ${!showArchived
                                ? 'bg-blue-600 text-white rounded-full shadow-md scale-105'
                                : 'text-blue-600 hover:text-blue-800 hover:scale-105'
                                }`}
                        >
                            Active Employees
                        </button>
                        <button
                            onClick={() => {
                                const params = new URLSearchParams();
                                if (filters.search) params.append('search', filters.search);
                                if (filters.section) params.append('section', filters.section);
                                if (filters.status) params.append('status', filters.status);
                                params.append('archived', 'true');

                                const url = `/employees?${params.toString()}`;
                                router.visit(url);
                            }}
                            className={`px-3 py-1.5 text-sm font-medium transition-all duration-300 ease-in-out transform ${showArchived
                                ? 'bg-blue-600 text-white rounded-full shadow-md scale-105'
                                : 'text-blue-600 hover:text-blue-800 hover:scale-105'
                                }`}
                        >
                            Archived Employees
                        </button>

                        {showArchived && selectedEmployees.size > 0 && (
                            <button
                                onClick={handleBulkRestore}
                                className="px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-full hover:bg-green-700 transition-colors shadow-md"
                            >
                                Restore Selected ({selectedEmployees.size})
                            </button>
                        )}
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="flex items-center gap-1">
                        {/* Search Input */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchTerm(value);
                                    handleFilterChange({ ...filters, search: value });
                                }}
                                className="w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg
                                className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        {/* Office Filter */}
                        <select
                            value={selectedOffice}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedOffice(value);
                                handleFilterChange({ ...filters, section: value });
                            }}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Offices</option>
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.name}
                                </option>
                            ))}
                        </select>

                        {/* Status Filter */}
                        <select
                            value={selectedStatus}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedStatus(value);
                                handleFilterChange({ ...filters, status: value });
                            }}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Status</option>
                            {employmentStatuses.map((status) => (
                                <option key={status.id} value={status.id}>
                                    {status.name}
                                </option>
                            ))}
                        </select>

                        {/* Position Filter */}
                        <select
                            value={selectedPosition}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSelectedPosition(value);
                                handleFilterChange({ ...filters, position: value });
                            }}
                            className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">All Positions</option>
                            {positions.map((position) => (
                                <option key={position} value={position}>
                                    {position}
                                </option>
                            ))}
                        </select>

                        {/* Clear Button */}
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedOffice('');
                                setSelectedStatus('');
                                setSelectedPosition('');
                                setFilters({ search: '', section: '', status: '', position: '' });
                                const url = showArchived ? '/employees?archived=true' : '/employees';
                                router.visit(url);
                            }}
                            className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg overflow-hidden">
                    {/* Data Count */}
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Showing <span className="font-semibold">
                                    {employees?.total || 0}
                                </span> employees
                            </div>
                            {(employees?.total || 0) > 10 && (
                                <div className="text-sm text-gray-500">
                                    Page {employees?.current_page || 1} of {employees?.last_page || 1}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <table className="w-full" style={{ tableLayout: 'fixed' }}>
                            <thead className="bg-gray-50">
                                <tr>
                                    {showArchived && (
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '3%' }}>
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="h-4 w-4 text-[#010066] focus:ring-[#010066] border-gray-300 rounded"
                                            />
                                        </th>
                                    )}
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '20%' }}>
                                        Name
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '18%' }}>
                                        Position
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '14%' }}>
                                        Office
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '11%' }}>
                                        Status
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '6%' }}>
                                        Sex
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '9%' }}>
                                        Date Started
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '9%' }}>
                                        Date Resigned
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: '9%' }}>
                                        Length of Service
                                    </th>
                                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider align-top" style={{ width: showArchived ? '11%' : '15%' }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(employees.data || employees).map((employee) => (
                                    <tr key={employee.id} className="hover:bg-gray-50">
                                        {showArchived && (
                                            <td className="px-2 py-3 align-top" style={{ width: '3%' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedEmployees.has(employee.id)}
                                                    onChange={() => handleSelectEmployee(employee.id)}
                                                    className="h-4 w-4 text-[#010066] focus:ring-[#010066] border-gray-300 rounded"
                                                />
                                            </td>
                                        )}
                                        <td className="px-2 py-3 align-top" style={{ width: '20%' }}>
                                            <div className="text-sm font-medium text-gray-900 break-words leading-relaxed">
                                                {employee.first_name} {employee.middle_name && employee.middle_name + ' '}{employee.last_name}{employee.suffix && ', ' + employee.suffix}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 align-top" style={{ width: '18%' }}>
                                            <div className="text-sm text-gray-900 break-words leading-relaxed">
                                                {employee.position || '-'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 align-top" style={{ width: '14%' }}>
                                            <div className="text-sm text-gray-900 break-words leading-relaxed">
                                                {employee.office_assigned?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 align-top" style={{ width: '11%' }}>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 break-words leading-relaxed">
                                                {employee.status_name || 'No Status'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 align-top" style={{ width: '6%' }}>
                                            <div className="text-sm text-gray-900">
                                                {employee.sex || '-'}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 text-sm text-gray-900 align-top" style={{ width: '9%' }}>
                                            {employee.date_started ? new Date(employee.date_started).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-2 py-3 text-sm text-gray-900 align-top" style={{ width: '9%' }}>
                                            {employee.date_resigned
                                                ? new Date(employee.date_resigned).toLocaleDateString()
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-2 py-3 align-top" style={{ width: '9%' }}>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-gray-700 break-words leading-relaxed">
                                                {employee.length_of_service || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-2 py-3 text-sm font-medium align-top" style={{ width: showArchived ? '11%' : '15%' }}>
                                            <div className="flex flex-wrap gap-1">
                                                {!showArchived && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEditEmployee(employee)}
                                                            className="px-2 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-100 hover:text-blue-800 hover:border-blue-500 transition-all duration-200 shadow-sm"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleArchive(employee)}
                                                            className={`px-2 py-1 text-xs font-medium border rounded transition-all duration-200 shadow-sm ${
                                                                employee.archivability_status?.status === 'active'
                                                                    ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-50'
                                                                    : employee.archivability_status?.status === 'archived'
                                                                    ? 'text-gray-400 border-gray-300 cursor-not-allowed bg-gray-50'
                                                                    : 'text-yellow-600 border-yellow-300 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-500'
                                                            }`}
                                                            title={employee.archivability_status?.message}
                                                        >
                                                            {employee.archivability_status?.status === 'active' ? 'Cannot Archive' : 
                                                             employee.archivability_status?.status === 'archived' ? 'Already Archived' : 
                                                             'Archive'}
                                                        </button>
                                                    </>
                                                )}
                                                {showArchived && (
                                                    <>
                                                        <button
                                                            onClick={() => handleRestore(employee)}
                                                            className="px-2 py-1 text-xs font-medium text-green-600 border border-green-300 rounded hover:bg-green-100 hover:text-green-800 hover:border-green-500 transition-all duration-200 shadow-sm"
                                                        >
                                                            Restore
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(employee)}
                                                            className="px-2 py-1 text-xs font-medium text-red-600 border border-red-300 rounded hover:bg-red-100 hover:text-red-800 hover:border-red-500 transition-all duration-200 shadow-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {employees && employees.data && employees.links && (
                        <div className="flex justify-center py-4 bg-white border-t border-gray-100">
                            <nav className="flex items-center space-x-1">
                                {/* Previous Button */}
                                <button
                                    onClick={() => employees.prev_page_url && handlePageChange(employees.prev_page_url)}
                                    disabled={!employees.prev_page_url}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${employees.prev_page_url
                                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    ←
                                </button>

                                {/* Page Numbers */}
                                {employees.links.map((link, index) => {
                                    if (index === 0 || index === employees.links.length - 1) return null;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => link.url && handlePageChange(link.url)}
                                            disabled={!link.url}
                                            className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${link.active
                                                ? 'bg-gray-900 text-white'
                                                : link.url
                                                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                                    : 'text-gray-300 cursor-not-allowed'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    );
                                })}

                                {/* Next Button */}
                                <button
                                    onClick={() => employees.next_page_url && handlePageChange(employees.next_page_url)}
                                    disabled={!employees.next_page_url}
                                    className={`px-3 py-1 text-sm font-medium rounded transition-all duration-200 ${employees.next_page_url
                                        ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    →
                                </button>
                            </nav>
                        </div>
                    )}
                </div>

                {/* Add Employee Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Employee</h3>
                            <form onSubmit={handleAddEmployee} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                        <input
                                            type="text"
                                            value={formData.middle_name}
                                            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                                        <input
                                            type="text"
                                            value={formData.suffix || ''}
                                            onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            placeholder="e.g., Jr., Sr., III"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                                        <select
                                            value={formData.sex || ''}
                                            onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        >
                                            <option value="">Select Sex</option>
                                            <option value="M">M</option>
                                            <option value="F">F</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                        <input
                                            type="text"
                                            value={formData.position || ''}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            placeholder="e.g., Engineer, Staff, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Office Assigned *</label>
                                        <select
                                            value={formData.office_assigned_id}
                                            onChange={(e) => setFormData({ ...formData, office_assigned_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        >
                                            <option value="">Select Office</option>
                                            {sections.map((section) => (
                                                <option key={section.id} value={section.id}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
                                        <select
                                            value={formData.employment_status_id}
                                            onChange={(e) => setFormData({ ...formData, employment_status_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            {employmentStatuses.map((status) => (
                                                <option key={status.id} value={status.id}>
                                                    {status.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Started</label>
                                        <input
                                            type="date"
                                            value={formData.date_started || ''}
                                            onChange={(e) => setFormData({ ...formData, date_started: e.target.value || null })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Resigned</label>
                                        <input
                                            type="date"
                                            value={formData.date_resigned || ''}
                                            onChange={(e) => setFormData({ ...formData, date_resigned: e.target.value || null })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Leave empty if currently employed</p>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseAddModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-[#010066] text-white rounded-lg hover:bg-[#010066]/80"
                                    >
                                        Add Employee
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Employee Modal */}
                {showEditModal && editingEmployee && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Employee</h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                        <input
                                            type="text"
                                            value={formData.first_name}
                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                        <input
                                            type="text"
                                            value={formData.middle_name}
                                            onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                        <input
                                            type="text"
                                            value={formData.last_name}
                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Suffix</label>
                                        <input
                                            type="text"
                                            value={formData.suffix || ''}
                                            onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            placeholder="e.g., Jr., Sr., III"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Sex</label>
                                        <select
                                            value={formData.sex || ''}
                                            onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        >
                                            <option value="">Select Sex</option>
                                            <option value="M">M</option>
                                            <option value="F">F</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                                        <input
                                            type="text"
                                            value={formData.position || ''}
                                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            placeholder="e.g., Engineer, Staff, etc."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Office Assigned *</label>
                                        <select
                                            value={formData.office_assigned_id}
                                            onChange={(e) => setFormData({ ...formData, office_assigned_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        >
                                            <option value="">Select Office</option>
                                            {sections.map((section) => (
                                                <option key={section.id} value={section.id}>
                                                    {section.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status *</label>
                                        <select
                                            value={formData.employment_status_id}
                                            onChange={(e) => setFormData({ ...formData, employment_status_id: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                            required
                                        >
                                            <option value="">Select Status</option>
                                            {employmentStatuses.map((status) => (
                                                <option key={status.id} value={status.id}>
                                                    {status.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Started</label>
                                        <input
                                            type="date"
                                            value={formData.date_started || ''}
                                            onChange={(e) => setFormData({ ...formData, date_started: e.target.value || null })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Resigned</label>
                                        <input
                                            type="date"
                                            value={formData.date_resigned || ''}
                                            onChange={(e) => setFormData({ ...formData, date_resigned: e.target.value || null })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#010066]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Leave empty if currently employed</p>
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseEditModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUpdateEmployee}
                                        className="px-4 py-2 bg-[#010066] text-white rounded-lg hover:bg-[#010066]/80"
                                    >
                                        Update Employee
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Import Employee Data</h3>
                            
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-xs text-yellow-800">
                                        <strong>Important:</strong> Make sure your Excel file contains all required columns: NAME, SURNAME, OFFICE, POSITION TITLE, etc.
                                    </p>
                                </div>

                                {/* Import Options */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Choose Import Type:</h4>
                                    
                                    {/* Normal Import Option */}
                                    <div 
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            !resetRecords 
                                                ? 'border-blue-500 bg-blue-50' 
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                        onClick={() => setResetRecords(false)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="mt-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    !resetRecords 
                                                        ? 'border-blue-500 bg-blue-500' 
                                                        : 'border-gray-300'
                                                }`}>
                                                    {!resetRecords && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900 flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    Normal Import
                                                </h5>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Add new employees and update existing ones. No data will be deleted.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Reset + Import Option */}
                                    <div 
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            resetRecords 
                                                ? 'border-red-500 bg-red-50' 
                                                : 'border-gray-200 bg-white hover:border-gray-300'
                                        }`}
                                        onClick={() => setResetRecords(true)}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <div className="mt-1">
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                                    resetRecords 
                                                        ? 'border-red-500 bg-red-500' 
                                                        : 'border-gray-300'
                                                }`}>
                                                    {resetRecords && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900 flex items-center">
                                                    <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                    Reset + Import
                                                </h5>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Delete all existing records and replace with new data.
                                                </p>
                                                {resetRecords && (
                                                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                                                        <strong>⚠️ WARNING:</strong> This will permanently delete all current employees, contracts, and history.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFileSelect}
                                    className={`px-4 py-2 rounded-lg text-white ${
                                        resetRecords 
                                            ? 'bg-red-600 hover:bg-red-700' 
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                >
                                    Select Excel File
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}