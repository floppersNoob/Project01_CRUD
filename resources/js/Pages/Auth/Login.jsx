import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div>
            <Head title="Admin Login" />
            <div 
                className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
                style={{ 
                    backgroundImage: 'url(/assets/images/dpwh_background.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="relative z-10 w-full max-w-3xl mx-4">
                    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[400px]">
                        
                        <div className="w-full lg:w-1/2 bg-gradient-to-br from-orange-500 to-orange-600 p-6 flex flex-col justify-center items-center text-white">
                            <div className="mb-4">
                                <img 
                                    src="/assets/images/DPWH_logo.png" 
                                    alt="DPWH Logo" 
                                    className="w-20 h-20 object-contain"
                                />
                            </div>
                            
                            <h1 className="text-xl font-bold text-center mb-2 leading-tight">
                                DEPARTMENT OF PUBLIC<br />WORKS AND HIGHWAYS
                            </h1>
                            
                            <p className="text-xs text-center opacity-90 font-medium">
                                1ST DEO - DISTRICT ENGINEERING OFFICE
                            </p>
                            
                            <div className="mt-4 text-center">
                                <div className="w-8 h-1 bg-white mx-auto mb-2"></div>
                                <p className="text-xs opacity-75">Employee Profiling System</p>
                            </div>
                        </div>

                        <div className="w-full lg:w-1/2 bg-white p-6 flex flex-col justify-center">
                            <div className="max-w-xs mx-auto w-full">
                                <div className="text-center mb-5">
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">ADMIN LOGIN</h2>
                                    <div className="w-12 h-1 bg-orange-500 mx-auto"></div>
                                </div>

                                {status && (
                                    <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded-lg text-xs">
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-3">
                                    <div>
                                        <label htmlFor="username" className="block text-xs font-semibold text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <input
                                            id="username"
                                            type="text"
                                            name="username"
                                            value={data.email}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-xs"
                                            placeholder="Enter your username"
                                            autoComplete="username"
                                            autoFocus
                                            onChange={(e) => setData('email', e.target.value)}
                                        />
                                        {errors.email && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1">
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                value={data.password}
                                                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-900 placeholder-gray-500 text-xs"
                                                placeholder="Enter your password"
                                                autoComplete="current-password"
                                                onChange={(e) => setData('password', e.target.value)}
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            type="checkbox"
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-3 w-3 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="remember" className="ml-2 block text-xs text-gray-700">
                                            Remember me
                                        </label>
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 font-semibold text-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                        >
                                            LOGIN
                                        </button>
                                    </div>

                                    {canResetPassword && (
                                        <div className="text-center pt-2">
                                            <Link
                                                href={route('password.request')}
                                                className="text-xs text-orange-600 hover:text-orange-700 underline font-medium transition-colors"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                    )}
                                </form>

                                <div className="mt-4 text-center text-gray-500 text-xs">
                                    <p className="font-medium">DPWH Employee Profiling System</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
