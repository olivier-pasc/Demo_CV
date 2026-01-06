import { useState } from 'react';
import { uploadCV } from '../api/client';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { UploadCloud, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);
        try {
            const data = await uploadCV(file);
            setResult(data);
        } catch (err) {
            setError("Failed to upload CV. Please try again.");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-left"
                >
                    <h1 className="text-5xl font-extrabold tracking-tight text-randstad-dark mb-6 leading-tight">
                        find a job that feels good.
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 font-light">
                        Upload your CV and let our technology find the perfect match for your skills and humanity.
                    </p>
                    <div className="flex gap-4">
                        <Button className="font-bold text-lg px-8">Start your search</Button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden md:block"
                >
                    {/* abstract visual */}
                    <div className="relative h-80 w-full rounded-tr-[4rem] rounded-bl-[4rem] bg-randstad-blue/10 overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800')] bg-cover bg-center opacity-80 mix-blend-multiply"></div>
                        <div className="absolute bottom-6 left-6 right-6 bg-white p-4 rounded-xl shadow-lg">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-randstad-yellow flex items-center justify-center font-bold text-randstad-dark">85%</div>
                                <div>
                                    <p className="text-sm font-bold text-randstad-dark">Match Rate</p>
                                    <p className="text-xs text-gray-500">Based on your skills</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="bg-randstad-grey rounded-2xl p-10 relative overflow-hidden">
                <div className="relative z-10 max-w-xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-randstad-dark mb-6">Analyze your resume</h2>

                    <Card className="p-8 border-dashed border-2 border-gray-300 bg-white hover:border-randstad-blue transition-colors cursor-pointer group">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="p-4 bg-blue-50 text-randstad-blue rounded-full group-hover:scale-110 transition-transform">
                                <UploadCloud size={40} />
                            </div>
                            <div className="text-center w-full">
                                <label htmlFor="cv-upload" className="cursor-pointer w-full block">
                                    <span className="mt-2 text-base font-bold text-randstad-blue hover:underline">
                                        Upload your resume (PDF)
                                    </span>
                                    <input id="cv-upload" type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                                </label>
                                <p className="mt-2 text-sm text-gray-500">We'll extract your skills automatically.</p>
                            </div>
                            {file && (
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-800 bg-gray-100 px-4 py-2 rounded-lg w-full justify-center">
                                    <FileText size={16} /> {file.name}
                                </div>
                            )}

                            <Button
                                onClick={handleUpload}
                                disabled={!file || uploading}
                                className="w-full mt-2 rounded-full"
                            >
                                {uploading ? "Analyzing..." : "Analyze Profile"}
                            </Button>
                        </div>
                    </Card>

                    {error && (
                        <div className="mt-6 p-4 rounded-lg bg-red-50 text-red-700 flex items-center gap-2 text-left">
                            <AlertCircle size={20} /> <span className="text-sm font-semibold">{error}</span>
                        </div>
                    )}
                </div>
            </div>

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-16"
                >
                    <div className="flex items-center gap-3 text-2xl font-bold text-randstad-dark mb-8">
                        <CheckCircle className="text-green-500" size={32} />
                        Your Profile Analysis
                    </div>
                    <Card className="p-8 bg-white shadow-xl border-l-4 border-randstad-blue rounded-r-xl">
                        <div className="flex flex-col md:flex-row gap-8">
                            <div className="md:w-1/3">
                                <div className="h-20 w-20 rounded-full bg-randstad-grey flex items-center justify-center text-2xl font-bold text-randstad-blue mb-4">
                                    {result.full_name?.[0] || "?"}
                                </div>
                                <h3 className="text-2xl font-bold text-randstad-dark">{result.full_name}</h3>
                                <p className="text-gray-500 mb-4">{result.email}</p>

                                <div className="mt-6">
                                    <h4 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-3">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {result.skills?.map((s: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-randstad-blue rounded-full text-sm font-semibold hover:bg-randstad-blue hover:text-white transition-colors cursor-default">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="md:w-2/3 border-t md:border-t-0 md:border-l border-gray-100 md:pl-8 pt-8 md:pt-0">
                                <h4 className="font-bold text-lg text-randstad-dark mb-4">Professional Summary</h4>
                                <p className="text-gray-700 leading-relaxed text-lg">
                                    {result.extracted_data?.summary || "No summary available."}
                                </p>

                                <div className="mt-8 flex gap-4">
                                    <Button className="rounded-full bg-randstad-blue hover:bg-blue-800">
                                        View Matched Jobs <ArrowRight size={16} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )}
        </div>
    );
}
