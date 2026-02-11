import React from 'react';

const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    title: 'text-red-800',
                    message: 'text-red-600',
                    icon: 'text-red-500',
                    button: 'bg-red-600 hover:bg-red-700 text-white'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    title: 'text-yellow-800',
                    message: 'text-yellow-600',
                    icon: 'text-yellow-500',
                    button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
                };
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    title: 'text-green-800',
                    message: 'text-green-600',
                    icon: 'text-green-500',
                    button: 'bg-green-600 hover:bg-green-700 text-white'
                };
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    title: 'text-blue-800',
                    message: 'text-blue-600',
                    icon: 'text-blue-500',
                    button: 'bg-blue-600 hover:bg-blue-700 text-white'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div 
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    onClick={onClose}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                    <div className={`${styles.bg} px-4 pt-5 pb-4 sm:p-6 sm:pb-4`}>
                        <div className="sm:flex sm:items-start">
                            <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-white rounded-full sm:mx-0 sm:h-10 sm:w-10">
                                {type === 'error' && (
                                    <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {type === 'warning' && (
                                    <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                )}
                                {type === 'success' && (
                                    <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                                {type === 'info' && (
                                    <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )}
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className={`text-lg font-medium leading-6 ${styles.title}`}>
                                    {title}
                                </h3>
                                <div className={`mt-2 ${styles.message}`}>
                                    <p className="text-sm">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className={`${styles.bg} px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse`}>
                        <button
                            type="button"
                            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm`}
                            onClick={onClose}
                        >
                            OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Alert utility functions
export const showAlert = ({ title, message, type = 'info' }) => {
    return new Promise((resolve) => {
        const AlertWrapper = () => {
            const [isOpen, setIsOpen] = React.useState(true);

            const handleClose = () => {
                setIsOpen(false);
                resolve(true);
            };

            return (
                <AlertModal
                    isOpen={isOpen}
                    onClose={handleClose}
                    title={title}
                    message={message}
                    type={type}
                />
            );
        };

        // Create and render the alert
        const alertElement = React.createElement(AlertWrapper);
        const alertContainer = document.createElement('div');
        document.body.appendChild(alertContainer);
        
        // Simple render (without React Router context)
        import('react-dom/client').then(({ createRoot }) => {
            const root = createRoot(alertContainer);
            root.render(alertElement);
        });
    });
};

export default AlertModal;
