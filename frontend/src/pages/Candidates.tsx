import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCandidates, deleteCandidate } from '../api/client';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Users, Mail, Calendar, FileText, Trash2, X, Briefcase, GraduationCap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Candidate {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
    skills: string[];
    cv_url?: string;
    extracted_data: {
        summary?: string;
        experience_years?: number;
        education?: Array<{ degree: string; institution: string; year: string }>;
        work_experience?: Array<{ title: string; company: string; duration: string; description: string }>;
    };
    created_at: string;
}

export default function Candidates() {
    const queryClient = useQueryClient();
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const { data: candidates, isLoading } = useQuery({
        queryKey: ['candidates'],
        queryFn: getCandidates,
    });

    const deleteMutation = useMutation({
        mutationFn: deleteCandidate,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
            setDeleteConfirm(null);
            if (selectedCandidate && selectedCandidate.id === deleteConfirm) {
                setSelectedCandidate(null);
            }
        },
    });

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-randstad-dark mb-2">
                        Candidate Database
                    </h1>
                    <p className="text-gray-600">View and manage candidate profiles</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    <Users className="text-randstad-blue" size={20} />
                    <span className="font-bold text-randstad-dark">
                        {candidates?.length || 0} Candidates
                    </span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full text-center py-20">
                        <div className="animate-spin h-12 w-12 border-4 border-randstad-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 font-semibold">Loading candidates...</p>
                    </div>
                ) : candidates && candidates.length > 0 ? (
                    candidates.map((candidate: Candidate) => (
                        <motion.div
                            key={candidate.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="p-6 h-full flex flex-col justify-between hover:shadow-xl transition-all border border-gray-200 hover:border-randstad-blue group cursor-pointer">
                                <div onClick={() => setSelectedCandidate(candidate)}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="h-14 w-14 rounded-full bg-randstad-blue/10 flex items-center justify-center text-xl font-bold text-randstad-blue group-hover:bg-randstad-blue group-hover:text-white transition-all">
                                            {candidate.full_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl text-randstad-dark mb-2 leading-tight">
                                        {candidate.full_name}
                                    </h3>

                                    {candidate.email && (
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                            <Mail size={14} className="text-gray-400" />
                                            <span className="truncate">{candidate.email}</span>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2 mb-4 mt-4">
                                        {candidate.skills?.slice(0, 3).map((skill, i) => (
                                            <span key={i} className="text-xs bg-randstad-grey text-gray-700 px-3 py-1 rounded-full font-medium">
                                                {skill}
                                            </span>
                                        ))}
                                        {candidate.skills?.length > 3 && (
                                            <span className="text-xs text-gray-400 font-semibold">
                                                +{candidate.skills.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <Calendar size={14} />
                                        {new Date(candidate.created_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteConfirm(candidate.id);
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-randstad-grey rounded-2xl">
                        <Users size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-randstad-dark mb-2">No candidates yet</h3>
                        <p className="text-gray-600 mb-6">Upload CVs to start building your talent pool</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <Trash2 className="text-red-600" size={32} />
                                </div>
                                <h3 className="text-2xl font-bold text-randstad-dark mb-2">Delete Candidate?</h3>
                                <p className="text-gray-600 mb-6">
                                    This action cannot be undone. The candidate profile will be permanently removed.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 px-6 py-3 rounded-full border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        onClick={() => handleDelete(deleteConfirm)}
                                        disabled={deleteMutation.isPending}
                                        className="flex-1 bg-red-600 hover:bg-red-700"
                                    >
                                        {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Candidate Detail Modal */}
            <AnimatePresence>
                {selectedCandidate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
                        onClick={() => setSelectedCandidate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl my-8"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-br from-randstad-blue to-blue-700 p-8 text-white rounded-t-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                                <div className="relative z-10">
                                    <button
                                        onClick={() => setSelectedCandidate(null)}
                                        className="absolute top-0 right-0 p-2 hover:bg-white/20 rounded-lg transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                    <div className="flex items-start gap-6">
                                        <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-3xl font-bold">
                                            {selectedCandidate.full_name?.[0]?.toUpperCase() || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-3xl font-bold mb-2">{selectedCandidate.full_name}</h2>
                                            <div className="flex flex-wrap gap-4 text-sm opacity-90">
                                                {selectedCandidate.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={16} />
                                                        {selectedCandidate.email}
                                                    </div>
                                                )}
                                                {selectedCandidate.extracted_data?.experience_years && (
                                                    <div className="flex items-center gap-2">
                                                        <Briefcase size={16} />
                                                        {selectedCandidate.extracted_data.experience_years} years experience
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto">
                                {/* Summary */}
                                {selectedCandidate.extracted_data?.summary && (
                                    <div>
                                        <h3 className="text-xl font-bold text-randstad-dark mb-3 flex items-center gap-2">
                                            <FileText size={20} className="text-randstad-blue" />
                                            Professional Summary
                                        </h3>
                                        <p className="text-gray-700 leading-relaxed">
                                            {selectedCandidate.extracted_data.summary}
                                        </p>
                                    </div>
                                )}

                                {/* Skills */}
                                {selectedCandidate.skills && selectedCandidate.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-randstad-dark mb-3">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCandidate.skills.map((skill, i) => (
                                                <span
                                                    key={i}
                                                    className="px-4 py-2 bg-randstad-grey text-gray-700 rounded-full font-medium hover:bg-randstad-blue hover:text-white transition-colors cursor-default"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Work Experience */}
                                {selectedCandidate.extracted_data?.work_experience && selectedCandidate.extracted_data.work_experience.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-randstad-dark mb-4 flex items-center gap-2">
                                            <Briefcase size={20} className="text-randstad-blue" />
                                            Work Experience
                                        </h3>
                                        <div className="space-y-4">
                                            {selectedCandidate.extracted_data.work_experience.map((exp, i) => (
                                                <div key={i} className="border-l-4 border-randstad-blue pl-4 py-2">
                                                    <h4 className="font-bold text-lg text-randstad-dark">{exp.title}</h4>
                                                    <p className="text-gray-600 font-semibold">{exp.company}</p>
                                                    <p className="text-sm text-gray-500 mb-2">{exp.duration}</p>
                                                    <p className="text-gray-700">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Education */}
                                {selectedCandidate.extracted_data?.education && selectedCandidate.extracted_data.education.length > 0 && (
                                    <div>
                                        <h3 className="text-xl font-bold text-randstad-dark mb-4 flex items-center gap-2">
                                            <GraduationCap size={20} className="text-randstad-blue" />
                                            Education
                                        </h3>
                                        <div className="space-y-3">
                                            {selectedCandidate.extracted_data.education.map((edu, i) => (
                                                <div key={i} className="bg-randstad-grey p-4 rounded-lg">
                                                    <h4 className="font-bold text-randstad-dark">{edu.degree}</h4>
                                                    <p className="text-gray-600">{edu.institution}</p>
                                                    <p className="text-sm text-gray-500">{edu.year}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* CV Link */}
                                {selectedCandidate.cv_url && (
                                    <div className="pt-4 border-t border-gray-200">
                                        <a
                                            href={selectedCandidate.cv_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-randstad-blue hover:text-blue-800 font-semibold"
                                        >
                                            <FileText size={18} />
                                            View Original CV
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    Added on {new Date(selectedCandidate.created_at).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedCandidate(null);
                                        setDeleteConfirm(selectedCandidate.id);
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Delete Candidate
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
