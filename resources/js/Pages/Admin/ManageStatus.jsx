import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import AdminLayout from '../../Layouts/AdminLayout';

export default function EmploymentStatusIndex({ employmentStatuses, showArchived }) {
    const { flash } = usePage().props;
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingStatus, setEditingStatus] = useState(null);
    const [customAlert, setCustomAlert] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingMessage, setProcessingMessage] = useState('');
    const [formData, setFormData] = useState({
        name: '',
    });

    // Custom Alert Functions (SweetAlert-style)
    const showSuccessAlert = (title, message, options = {}) => {
        setCustomAlert({
            type: 'success',
            title,
            message,
            icon: '✓',
            showConfirmButton: options.showConfirmButton !== false,
            confirmButtonText: options.confirmButtonText || 'OK',
            timer: options.timer || 3000,
            allowOutsideClick: options.allowOutsideClick !== false
        });
        
        if (options.timer) {
            setTimeout(() => setCustomAlert(null), options.timer);
        }
    };

    const showErrorAlert = (title, message, options = {}) => {
        setCustomAlert({
            type: 'error',
            title,
            message,
            icon: '✕',
            showConfirmButton: options.showConfirmButton !== false,
            confirmButtonText: options.confirmButtonText || 'OK',
            timer: options.timer || 4000,
            allowOutsideClick: options.allowOutsideClick !== false
        });
        
        if (options.timer) {
            setTimeout(() => setCustomAlert(null), options.timer);
        }
    };

    const showInfoAlert = (title, message, options = {}) => {
        setCustomAlert({
            type: 'info',
            title,
            message,
            icon: 'ℹ',
            showConfirmButton: options.showConfirmButton !== false,
            confirmButtonText: options.confirmButtonText || 'OK',
            timer: options.timer || 3000,
            allowOutsideClick: options.allowOutsideClick !== false
        });
        
        if (options.timer) {
            setTimeout(() => setCustomAlert(null), options.timer);
        }
    };

    const showWarningAlert = (title, message, options = {}) => {
        setCustomAlert({
            type: 'warning',
            title,
            message,
            icon: '⚠',
            showConfirmButton: options.showConfirmButton !== false,
            confirmButtonText: options.confirmButtonText || 'OK',
            cancelButtonText: options.cancelButtonText || 'Cancel',
            showCancelButton: options.showCancelButton || false,
            timer: options.timer || 0,
            allowOutsideClick: options.allowOutsideClick !== false
        });
        
        if (options.timer && !options.showCancelButton) {
            setTimeout(() => setCustomAlert(null), options.timer);
        }
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
    const handleOpenCreateModal = () => {
        setEditingStatus(null);
        setFormData({ name: '' });
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingStatus(null);
        setFormData({ name: '' });
        showInfoAlert('Cancelled', 'Employment status form has been cancelled.');
    };

    const validateForm = (data) => {
        if (!data.name.trim()) {
            showErrorAlert('Validation Error', 'Employment status name is required.');
            return false;
        }
        if (data.name.trim().length < 2) {
            showErrorAlert('Validation Error', 'Employment status name must be at least 2 characters.');
            return false;
        }
        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Show loading effect immediately when button is clicked
        setIsProcessing(true);
        setProcessingMessage(editingStatus ? `Updating "${formData.name}"...` : `Creating "${formData.name}"...`);
        
        // Validate form after showing loading
        if (!validateForm(formData)) {
            setIsProcessing(false);
            return;
        }
        
        if (editingStatus) {
            // Update existing employment status
            router.put(`/employment-status/${editingStatus.id}`, formData, {
                onSuccess: (page) => {
                    setIsProcessing(false);
                    handleCloseModal();
                    showSuccessAlert('Success!', 'Employment status updated successfully!');
                    setTimeout(() => {
                        router.reload(); // Refresh the page to show updated data
                    }, 1500);
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    showErrorAlert('Error', 'Failed to update employment status. Please try again.');
                }
            });
        } else {
            // Create new employment status
            router.post('/employment-status', formData, {
                onSuccess: (page) => {
                    setIsProcessing(false);
                    handleCloseModal();
                    showSuccessAlert('Success!', 'Employment status created successfully!');
                    setTimeout(() => {
                        router.reload(); // Refresh the page to show new data
                    }, 1500);
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    showErrorAlert('Error', 'Failed to create employment status. Please try again.');
                }
            });
        }
    };

    const openEditModal = (status) => {
        setEditingStatus(status);
        setFormData({
            name: status.name,
        });
        setIsCreateModalOpen(true);
        showInfoAlert('Edit Employment Status', `Editing "${status.name}" employment status details.`);
    };

    const closeModal = () => {
        setIsCreateModalOpen(false);
        setEditingStatus(null);
        setFormData({ name: '' });
    };

    const archiveStatus = async (status) => {
        const result = await showConfirmAlert(
            'Archive Employment Status',
            `Are you sure you want to archive "${status.name}"?`,
            {
                confirmButtonText: 'Yes, archive it',
                cancelButtonText: 'Cancel'
            }
        );
        
        if (result) {
            // Show loading effect
            setIsProcessing(true);
            setProcessingMessage(`Archiving "${status.name}"...`);
            
            router.post(`/employment-status/${status.id}/archive`, {}, {
                onSuccess: (page) => {
                    setIsProcessing(false);
                    showSuccessAlert('Success!', `Employment status "${status.name}" archived successfully!`);
                    setTimeout(() => {
                        router.reload();
                    }, 1500);
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    showErrorAlert('Error', 'Failed to archive employment status. Please try again.');
                },
                onFinish: () => {
                    setIsProcessing(false);
                }
            });
        }
    };

    const restoreStatus = async (status) => {
        const result = await showConfirmAlert(
            'Restore Employment Status',
            `Are you sure you want to restore "${status.name}"?`,
            {
                confirmButtonText: 'Yes, restore it',
                cancelButtonText: 'Cancel'
            }
        );
        
        if (result) {
            // Show loading effect
            setIsProcessing(true);
            setProcessingMessage(`Restoring "${status.name}"...`);
            
            router.post(`/employment-status/${status.id}/restore`, {}, {
                onSuccess: (page) => {
                    setIsProcessing(false);
                    showSuccessAlert('Success!', `Employment status "${status.name}" restored successfully!`);
                    setTimeout(() => {
                        router.reload();
                    }, 1500);
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    showErrorAlert('Error', 'Failed to restore employment status. Please try again.');
                },
                onFinish: () => {
                    setIsProcessing(false);
                }
            });
        }
    };

    const deleteStatus = async (status) => {
        const result = await showConfirmAlert(
            'Delete Employment Status',
            `Are you sure you want to permanently delete "${status.name}"? This action cannot be undone.`,
            {
                confirmButtonText: 'Yes, delete it',
                cancelButtonText: 'Cancel'
            }
        );
        
        if (result) {
            // Show loading effect
            setIsProcessing(true);
            setProcessingMessage(`Deleting "${status.name}"...`);
            
            router.delete(`/employment-status/${status.id}`, {
                onSuccess: (page) => {
                    setIsProcessing(false);
                    showSuccessAlert('Success!', `Employment status "${status.name}" deleted successfully!`);
                    setTimeout(() => {
                        router.reload();
                    }, 1500);
                },
                onError: (errors) => {
                    setIsProcessing(false);
                    showErrorAlert('Error', 'Failed to delete employment status. Please try again.');
                },
                onFinish: () => {
                    setIsProcessing(false);
                }
            });
        }
    };

    return (
        <AdminLayout>
            {/* Custom Styles for DPWH Loading Animations */}
            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
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
                .animate-shimmer {
                    animation: shimmer 2.5s infinite;
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
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
                .animate-minimal-pulse {
                    animation: circle-pulse 2s ease-in-out infinite;
                }
            `}</style>
            
            <div className="space-y-6">
                {/* Page Header with Actions */}
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Employment Status Management</h2>
                        <p className="text-sm text-gray-500 mt-1">Manage employment status types</p>
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="px-4 py-2 bg-[#010066] text-white rounded-lg hover:bg-[#010066]/80 transition-colors flex items-center"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Status
                    </button>
                </div>

                {/* Pill Tab Buttons */}
                <div className="mb-6 flex justify-start">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => router.visit('/employment-status')}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out transform ${
                                !showArchived
                                    ? 'bg-blue-600 text-white rounded-full shadow-md scale-105'
                                    : 'text-blue-600 hover:text-blue-800 hover:scale-105'
                            }`}
                        >
                            Active Status
                        </button>
                        <button
                            onClick={() => router.visit('/employment-status?archived=true')}
                            className={`px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out transform ${
                                showArchived
                                    ? 'bg-blue-600 text-white rounded-full shadow-md scale-105'
                                    : 'text-blue-600 hover:text-blue-800 hover:scale-105'
                            }`}
                        >
                            Archived Status
                        </button>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                        {flash.success}
                    </div>
                )}

                {/* Processing Loading Overlay */}
                {isProcessing && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] backdrop-blur-sm">
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
                                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-circle-pulse" style={{animationDelay: '0.5s'}}></div>
                                    <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-circle-pulse" style={{animationDelay: '1s'}}></div>
                                    <div className="absolute bottom-2 right-2 w-1.5 h-1.5 bg-[#010066] rounded-full animate-circle-pulse" style={{animationDelay: '1.5s'}}></div>
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
                                <div className="w-1.5 h-1.5 bg-[#EB3505] rounded-full animate-minimal-pulse" style={{animationDelay: '0.3s'}}></div>
                                <div className="w-1.5 h-1.5 bg-[#010066] rounded-full animate-minimal-pulse" style={{animationDelay: '0.6s'}}></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Custom Alert Modal (SweetAlert-style) */}
                {customAlert && (
                    <div 
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] backdrop-blur-sm"
                        onClick={() => customAlert.allowOutsideClick && setCustomAlert(null)}
                    >
                        <div 
                            className="bg-white rounded-2xl p-8 flex flex-col items-center max-w-md mx-4 shadow-2xl border border-gray-100 transform transition-all duration-300 scale-100 animate-float"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Alert Icon */}
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                customAlert.type === 'success' ? 'bg-green-100' :
                                customAlert.type === 'error' ? 'bg-red-100' :
                                customAlert.type === 'warning' ? 'bg-yellow-100' :
                                'bg-blue-100'
                            }`}>
                                <div className={`text-2xl font-bold ${
                                    customAlert.type === 'success' ? 'text-green-600' :
                                    customAlert.type === 'error' ? 'text-red-600' :
                                    customAlert.type === 'warning' ? 'text-yellow-600' :
                                    'text-blue-600'
                                }`}>
                                    {customAlert.icon}
                                </div>
                            </div>
                            
                            {/* Alert Content */}
                            <h3 className={`text-lg font-semibold mb-2 text-center ${
                                customAlert.type === 'success' ? 'text-green-800' :
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
                                        className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
                                            customAlert.type === 'success' ? 'bg-green-600 text-white hover:bg-green-700' :
                                            customAlert.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700' :
                                            customAlert.type === 'warning' ? 'bg-yellow-600 text-white hover:bg-yellow-700' :
                                            'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {customAlert.confirmButtonText}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Employment Status Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {showArchived ? 'Archived Employment Status' : 'Active Employment Status'}
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {employmentStatuses.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                                            No employment status found
                                        </td>
                                    </tr>
                                ) : (
                                    employmentStatuses.map((status) => (
                                        <tr key={status.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-blue-600 text-xs font-medium">
                                                            {status.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div className="ml-3">
                                                        <div className="text-sm font-medium text-gray-900">{status.name}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(status.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    {!showArchived ? (
                                                        <>
                                                            <button
                                                                onClick={() => openEditModal(status)}
                                                                className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-100 hover:text-blue-800 hover:border-blue-500 transition-all duration-200 shadow-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => archiveStatus(status)}
                                                                className="px-3 py-1 text-xs font-medium text-orange-600 border border-orange-300 rounded-md hover:bg-orange-100 hover:text-orange-800 hover:border-orange-500 transition-all duration-200 shadow-sm"
                                                            >
                                                                Archive
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => restoreStatus(status)}
                                                                className="px-3 py-1 text-xs font-medium text-green-600 border border-green-300 rounded-md hover:bg-green-100 hover:text-green-800 hover:border-green-500 transition-all duration-200 shadow-sm"
                                                            >
                                                                Restore
                                                            </button>
                                                            <button
                                                                onClick={() => deleteStatus(status)}
                                                                className="px-3 py-1 text-xs font-medium text-red-600 border border-red-300 rounded-md hover:bg-red-100 hover:text-red-800 hover:border-red-500 transition-all duration-200 shadow-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Create/Edit Modal */}
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {editingStatus ? 'Edit Employment Status' : 'Add New Employment Status'}
                            </h3>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                    >
                                        {editingStatus ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
