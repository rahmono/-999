
import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { dbService } from '../services/dbService';
import { Button } from '../components/Button';
import { useLanguage } from '../contexts/LanguageContext';
import { Grade, Subject } from '../types';

const AdminScreen: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'Grade' | 'Subject'>('Grade');
  const [feedback, setFeedback] = useState('');
  const [errorDetails, setErrorDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [editingId, setEditingId] = useState<string | null>(null);

  // Form States
  const [gradeName, setGradeName] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [selectedGradeId, setSelectedGradeId] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
        const [gData, sData] = await Promise.all([
            dbService.getAllGrades(),
            dbService.getAllSubjects()
        ]);
        setGrades(gData);
        setSubjects(sData);
    } catch (e: any) {
        setErrorDetails(e.message);
    }
  };

  const clearForm = () => {
    setEditingId(null);
    setGradeName('');
    setSubjectName('');
    setPdfFile(null);
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  const handleEditGrade = (g: Grade) => {
    setEditingId(g.id);
    setGradeName(g.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditSubject = (s: Subject) => {
    setEditingId(s.id);
    setSubjectName(s.name);
    setSelectedGradeId(s.gradeId);
    setPdfFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (type: 'Grade' | 'Subject', id: string) => {
    if (!window.confirm("Оё шумо мутмаин ҳастед?")) return;
    try {
        if (type === 'Grade') await dbService.deleteGrade(id);
        if (type === 'Subject') await dbService.deleteSubject(id);
        setFeedback("Нест карда шуд!");
        loadData();
    } catch (e: any) {
        setErrorDetails(e.message);
    }
  };

  const handleSave = async () => {
    if (isSubmitting) return;
    setFeedback('');
    setErrorDetails('');
    
    try {
      setIsSubmitting(true);
      if (activeTab === 'Grade' && gradeName) {
        if (editingId) await dbService.updateGrade(editingId, gradeName);
        else await dbService.addGrade(gradeName);
      } else if (activeTab === 'Subject' && subjectName && selectedGradeId) {
        let pdfUri = undefined;
        if (pdfFile) {
            setFeedback("Uploading PDF...");
            pdfUri = await dbService.uploadSubjectPDF(pdfFile);
        }

        if (editingId) {
            // If editing and no new file, keep existing uri by not sending it or handling in backend (backend currently expects uri to update)
            // For now, if editing and no file, we pass undefined which updates to null in my bad backend logic above? 
            // Corrected backend logic: UPDATE ... pdf_uri = ? ... if we pass undefined to json it might be missing.
            // Actually the service sends it. Let's rely on service logic.
            // If editing and no new file, we should probably pass the existing one or handle logic.
            // For simplicity in this demo: Re-upload required to change. If not provided, backend sets null. 
            // Let's improve UI: Only update PDF if file provided.
            // Wait, dbService.updateSubject sends the URI.
            const currentSubject = subjects.find(s => s.id === editingId);
            const uriToSend = pdfUri || currentSubject?.pdfUri;
            await dbService.updateSubject(editingId, selectedGradeId, subjectName, uriToSend);
        }
        else {
            await dbService.addSubject(selectedGradeId, subjectName, pdfUri);
        }
      } else {
        setFeedback(t.fill_error);
        setIsSubmitting(false);
        return;
      }
      clearForm();
      await loadData();
      setFeedback(t.success_add);
      setTimeout(() => setFeedback(''), 3000);
    } catch (e: any) {
      setErrorDetails(e.message || 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 transition-colors pb-[safe-bottom]">
      <Header title={t.admin_panel} />
      
      <div className="px-6 py-4 flex gap-3 overflow-x-auto no-scrollbar border-b dark:border-gray-800 shrink-0">
        <TabButton name="Grade" active={activeTab} label={t.grade} onClick={() => { setActiveTab('Grade'); clearForm(); }} />
        <TabButton name="Subject" active={activeTab} label={t.subject} onClick={() => { setActiveTab('Subject'); clearForm(); }} />
      </div>

      <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto no-scrollbar">
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl space-y-4 shrink-0">
            <h2 className="text-xl font-bold dark:text-white flex items-center justify-between">
                {editingId ? "Таҳрир" : t.add}
                {editingId && <button onClick={clearForm} className="text-xs font-normal text-blue-500">Бекор кардан</button>}
            </h2>
            
            {activeTab === 'Grade' && (
            <input 
                className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm" 
                placeholder={t.name_ph} 
                value={gradeName}
                onChange={e => setGradeName(e.target.value)}
            />
            )}

            {activeTab === 'Subject' && (
            <div className="space-y-4">
                <select 
                className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white outline-none shadow-sm"
                value={selectedGradeId}
                onChange={e => setSelectedGradeId(e.target.value)}
                >
                <option value="">{t.select_ph} {t.grade}</option>
                {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
                <input 
                className="w-full p-4 rounded-2xl bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white outline-none shadow-sm" 
                placeholder={t.name_ph} 
                value={subjectName}
                onChange={e => setSubjectName(e.target.value)}
                />
                
                <div className="p-4 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Китоби дарсӣ (PDF)</label>
                    <input 
                        id="pdf-upload"
                        type="file" 
                        accept="application/pdf"
                        onChange={e => setPdfFile(e.target.files ? e.target.files[0] : null)}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
                    />
                    {editingId && !pdfFile && (
                        <p className="text-xs text-orange-500 mt-2">Note: Uploading a new file will replace the existing textbook.</p>
                    )}
                </div>
            </div>
            )}

            <Button onClick={handleSave} fullWidth disabled={isSubmitting}>
                {isSubmitting ? t.loading : editingId ? "Навсозӣ" : t.add}
            </Button>
            
            {feedback && <div className="p-3 bg-blue-50 text-blue-600 rounded-xl text-center text-xs">{feedback}</div>}
            {errorDetails && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-center text-xs break-all">{errorDetails}</div>}
        </div>

        <div className="space-y-4 pb-12">
            <h3 className="font-bold text-gray-400 uppercase text-xs tracking-widest px-1">Маълумотҳои мавҷуда</h3>
            
            <div className="space-y-2">
                {activeTab === 'Grade' && grades.map(g => (
                    <AdminListItem key={g.id} title={g.name} onEdit={() => handleEditGrade(g)} onDelete={() => handleDelete('Grade', g.id)} />
                ))}
                
                {activeTab === 'Subject' && subjects.filter(s => !selectedGradeId || s.gradeId === selectedGradeId).map(s => (
                    <AdminListItem 
                        key={s.id} 
                        title={s.name} 
                        subtitle={grades.find(g => g.id === s.gradeId)?.name} 
                        extra={s.pdfUri ? <span className="text-[10px] text-green-600 bg-green-100 px-2 py-0.5 rounded-full">PDF</span> : null}
                        onEdit={() => handleEditSubject(s)} 
                        onDelete={() => handleDelete('Subject', s.id)} 
                    />
                ))}
                
                {(activeTab === 'Grade' && grades.length === 0) || 
                 (activeTab === 'Subject' && subjects.length === 0) ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Рӯйхат холӣ аст.</div>
                ) : null}
            </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ name, active, label, onClick }: any) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
        active === name 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      }`}
    >
      {label}
    </button>
);

const AdminListItem = ({ title, subtitle, extra, onEdit, onDelete }: any) => (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl shadow-sm">
        <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{title}</span>
                {extra}
            </div>
            {subtitle && <span className="text-[10px] text-gray-400 uppercase">{subtitle}</span>}
        </div>
        <div className="flex gap-2">
            <button onClick={onEdit} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>
            <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
            </button>
        </div>
    </div>
);

export default AdminScreen;
