import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getJobs, getMatches } from '../api/client';
import { Card } from '../components/ui/card';
import { Sparkles, AlertTriangle, TrendingUp, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Matches() {
    const [selectedJob, setSelectedJob] = useState<string | null>(null);
    const { data: jobs, isLoading: jobsLoading } = useQuery({ queryKey: ['jobs'], queryFn: getJobs });

    const { data: matches, isFetching, error } = useQuery({
        queryKey: ['matches', selectedJob],
        queryFn: () => getMatches(selectedJob!),
        enabled: !!selectedJob,
        retry: 1,
    });

    const selectedJobDetails = jobs?.find((j: any) => j.id === selectedJob);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-randstad-dark mb-2">
                        AI-Powered Matching
                    </h1>
                    <p className="text-gray-600">Find the perfect candidates for your positions</p>
                </div>
                <div className="w-full md:w-80">
                    <label className="block text-sm font-bold text-randstad-dark mb-2">
                        Select Job Position
                    </label>
                    <select
                        className="w-full rounded-lg border-2 border-gray-300 p-3 text-base font-semibold focus:ring-2 focus:ring-randstad-blue focus:border-randstad-blue outline-none bg-white transition-all"
                        onChange={(e) => setSelectedJob(e.target.value || null)}
                        value={selectedJob || ""}
                        disabled={jobsLoading}
                    >
                        <option value="">Choose a position...</option>
                        {jobs?.map((j: any) => (
                            <option key={j.id} value={j.id}>{j.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {selectedJobDetails && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-randstad-grey rounded-xl p-6 border-l-4 border-randstad-blue"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-randstad-blue rounded-lg">
                            <Award className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-randstad-dark mb-1">{selectedJobDetails.title}</h3>
                            <p className="text-gray-600 text-sm line-clamp-2">{selectedJobDetails.description}</p>
                            <div className="flex flex-wrap gap-2 mt-3">
                                {selectedJobDetails.requirements?.slice(0, 5).map((r: string, i: number) => (
                                    <span key={i} className="text-xs bg-white text-gray-700 px-3 py-1 rounded-full font-medium border border-gray-200">
                                        {r}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {!selectedJob && (
                <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="p-4 bg-blue-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <Sparkles size={40} className="text-randstad-blue" />
                    </div>
                    <h3 className="text-2xl font-bold text-randstad-dark mb-3">
                        Select a job to discover top talent
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        Our AI will analyze all candidates and identify the top 3 matches based on skills, experience, and potential.
                    </p>
                </div>
            )}

            {isFetching && (
                <div className="text-center py-24">
                    <div className="relative">
                        <div className="animate-spin h-16 w-16 border-4 border-randstad-blue border-t-transparent rounded-full mx-auto mb-6"></div>
                        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-randstad-blue" size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-randstad-dark mb-2">Analyzing candidates...</h3>
                    <p className="text-gray-600">Our AI is evaluating profiles and matching skills</p>
                </div>
            )}

            {error && (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                    <AlertTriangle className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-red-800 mb-2">Matching Failed</h3>
                    <p className="text-red-600">Unable to analyze candidates. Please try again later.</p>
                </div>
            )}

            {matches && !isFetching && (
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-green-600" size={28} />
                        <h2 className="text-2xl font-bold text-randstad-dark">
                            Top 3 Candidate Matches
                        </h2>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        {matches.matches?.length > 0 ? matches.matches.map((m: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-shadow">
                                    <div className="bg-gradient-to-br from-randstad-blue to-blue-700 p-6 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                        <span className="text-2xl font-black">#{idx + 1}</span>
                                                    </div>
                                                    {idx === 0 && (
                                                        <div className="px-3 py-1 bg-randstad-yellow text-randstad-dark rounded-full text-xs font-black">
                                                            BEST MATCH
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-3xl font-black">{m.match_score}%</div>
                                                    <div className="text-xs opacity-80">Match Score</div>
                                                </div>
                                            </div>
                                            <div className="font-mono text-sm opacity-75">ID: {m.candidate_id?.slice(0, 12)}...</div>
                                        </div>
                                    </div>

                                    <div className="p-6 space-y-5 bg-white">
                                        <div>
                                            <div className="flex items-center gap-2 font-bold text-green-700 mb-3">
                                                <CheckCircle2 size={18} />
                                                <span>Key Strengths</span>
                                            </div>
                                            <ul className="text-sm text-gray-700 space-y-2">
                                                {Array.isArray(m.strengths) ? m.strengths.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-green-500 mt-0.5">•</span>
                                                        <span className="flex-1">{s}</span>
                                                    </li>
                                                )) : (
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-green-500 mt-0.5">•</span>
                                                        <span className="flex-1">{m.strengths}</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100">
                                            <div className="flex items-center gap-2 font-bold text-amber-600 mb-3">
                                                <AlertTriangle size={18} />
                                                <span>Areas for Growth</span>
                                            </div>
                                            <ul className="text-sm text-gray-700 space-y-2">
                                                {Array.isArray(m.weaknesses) ? m.weaknesses.map((w: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2">
                                                        <span className="text-amber-500 mt-0.5">•</span>
                                                        <span className="flex-1">{w}</span>
                                                    </li>
                                                )) : (
                                                    <li className="flex items-start gap-2">
                                                        <span className="text-amber-500 mt-0.5">•</span>
                                                        <span className="flex-1">{m.weaknesses}</span>
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )) : (
                            <div className="col-span-full text-center py-12 bg-yellow-50 rounded-xl border border-yellow-200">
                                <AlertTriangle className="mx-auto text-yellow-600 mb-4" size={48} />
                                <h3 className="text-xl font-bold text-yellow-800 mb-2">No Matches Found</h3>
                                <p className="text-yellow-700">No candidates available for this position. Please upload CVs first.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
