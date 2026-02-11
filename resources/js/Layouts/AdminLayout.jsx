import React from 'react';
import { usePage } from '@inertiajs/react';
import Sidebar from '../Components/Sidebar';
import Header from '../Components/Header';

export default function AdminLayout({ children }) {
    const { flash } = usePage().props || {};

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pt-20">
                    <div className="container mx-auto px-6 py-8">
                        {flash?.success && (
                            <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                {flash.success}
                            </div>
                        )}
                        
                        {flash?.error && (
                            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                                {flash.error}
                            </div>
                        )}
                        
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
