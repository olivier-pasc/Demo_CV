import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJobs, createJob } from '../api/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Plus, Briefcase, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Jobs() {
    const queryClient = useQueryClient();
    const { data: jobs, isLoading } = useQuery({ queryKey: ['jobs'], queryFn: getJobs });

    const [newJob, setNewJob] = useState({ title: '', description: '', requirements: '' });
    const [isCreating, setIsCreating] = useState(false);

    const mutation = useMutation({
        mutationFn: createJob,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            setNewJob({ title: '', description: '', requirements: '' });
            setIsCreating(false);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            ...newJob,
            requirements: newJob.requirements.split(',').map(r => r.trim()).filter(Boolean),
        });
    };

    return (
        <div className="space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight text-randstad-dark mb-2">
                        Job Postings
                    </h1>
                    <p className="text-gray-600">Manage and create job opportunities</p>
                </div>
                <Button
                    onClick={() => setIsCreating(!isCreating)}
                    className="gap-2 shadow-lg"
                >
                    {isCreating ? <X size={18} /> : <Plus size={18} />}
                    {isCreating ? 'Cancel' : 'New Job'}
                </Button>
            </div>

            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <Card className="p-8 bg-white shadow-xl border-l-4 border-randstad-blue">
                            <h3 className="text-2xl font-bold text-randstad-dark mb-6">Create New Job Posting</h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-randstad-dark mb-2">
                                        Job Title *
                                    </label>
                                    <Input
                                        value={newJob.title}
                                        onChange={e => setNewJob({ ...newJob, title: e.target.value })}
                                        placeholder="e.g. Senior Software Engineer"
                                        className="border-gray-300 focus:border-randstad-blue"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-randstad-dark mb-2">
                                        Job Description *
                                    </label>
                                    <textarea
                                        className="w-full rounded-lg border border-gray-300 p-4 text-base focus:ring-2 focus:ring-randstad-blue focus:border-transparent outline-none resize-none"
                                        rows={6}
                                        value={newJob.description}
                                        onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                                        placeholder="Describe the role, responsibilities, and expectations..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-randstad-dark mb-2">
                                        Requirements (comma separated) *
                                    </label>
                                    <Input
                                        value={newJob.requirements}
                                        onChange={e => setNewJob({ ...newJob, requirements: e.target.value })}
                                        placeholder="Python, React, GCP, Communication Skills..."
                                        className="border-gray-300 focus:border-randstad-blue"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Separate each requirement with a comma</p>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-6 py-2.5 rounded-full border-2 border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <Button
                                        type="submit"
                                        disabled={mutation.isPending}
                                        className="px-8"
                                    >
                                        {mutation.isPending ? "Creating..." : "Create Job Posting"}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    <div className="col-span-full text-center py-20">
                        <div className="animate-spin h-12 w-12 border-4 border-randstad-blue border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 font-semibold">Loading opportunities...</p>
                    </div>
                ) : jobs && jobs.length > 0 ? (
                    jobs.map((job: any) => (
                        <motion.div
                            key={job.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Card className="p-6 h-full flex flex-col justify-between hover:shadow-xl transition-shadow border border-gray-200 hover:border-randstad-blue group">
                                <div>
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="p-2 bg-randstad-blue/10 rounded-lg group-hover:bg-randstad-blue/20 transition-colors">
                                            <Briefcase size={20} className="text-randstad-blue" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-xl text-randstad-dark mb-2 leading-tight">{job.title}</h3>
                                    <p className="text-sm text-gray-600 line-clamp-4 mb-4 leading-relaxed">{job.description}</p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {job.requirements?.slice(0, 4).map((r: string, i: number) => (
                                            <span key={i} className="text-xs bg-randstad-grey text-gray-700 px-3 py-1 rounded-full font-medium border border-gray-200">
                                                {r}
                                            </span>
                                        ))}
                                        {job.requirements?.length > 4 && (
                                            <span className="text-xs text-gray-400 font-semibold">
                                                +{job.requirements.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-gray-100 mt-auto">
                                    <Calendar size={14} />
                                    Posted: {new Date(job.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20 bg-randstad-grey rounded-2xl">
                        <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-randstad-dark mb-2">No job postings yet</h3>
                        <p className="text-gray-600 mb-6">Create your first job posting to get started</p>
                        <Button onClick={() => setIsCreating(true)}>
                            <Plus size={18} className="mr-2" /> Create First Job
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
