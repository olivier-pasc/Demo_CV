import { Link, Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen bg-white font-sans text-randstad-dark">
            <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
                <div className="container mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-randstad-blue text-white overflow-hidden transition-transform group-hover:scale-105">
                            <span className="relative z-10 text-2xl italic font-black">r</span>
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/10 to-transparent"></div>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-randstad-blue">randstad</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-base font-semibold text-gray-800 hover:text-randstad-blue transition-colors pb-1 border-b-2 border-transparent hover:border-randstad-blue">
                            Find a job
                        </Link>
                        <Link to="/jobs" className="text-base font-semibold text-gray-800 hover:text-randstad-blue transition-colors pb-1 border-b-2 border-transparent hover:border-randstad-blue">
                            For employers
                        </Link>
                        <Link to="/matches" className="text-base font-semibold text-gray-800 hover:text-randstad-blue transition-colors pb-1 border-b-2 border-transparent hover:border-randstad-blue">
                            Dashboard
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="hidden sm:block text-sm font-bold text-randstad-blue hover:text-blue-800 transition-colors">
                            Log in
                        </button>
                        <Link to="/jobs" className="rounded-full bg-randstad-blue px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-800 hover:shadow-lg active:scale-95">
                            Post a job
                        </Link>
                    </div>
                </div>
            </nav>
            <main className="container mx-auto pt-12 pb-24 px-4 sm:px-6 lg:px-8">
                <Outlet />
            </main>

            <footer className="bg-randstad-dark text-white py-12">
                <div className="container mx-auto px-6 text-center md:text-left">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <h3 className="font-bold text-xl mb-4">randstad</h3>
                            <p className="text-gray-400 text-sm">human forward.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-gray-200">Job seekers</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Browse jobs</li>
                                <li>Submit your CV</li>
                                <li>Job seeker resources</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4 text-gray-200">Employers</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>Post a job</li>
                                <li>Workforce management</li>
                                <li>Recruitment solutions</li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 pt-8 border-t border-gray-700 text-center text-xs text-gray-500">
                        © 2024 Randstad N.V. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
