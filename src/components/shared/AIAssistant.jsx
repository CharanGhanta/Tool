import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AIAssistant({ context, onResult }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Context: ${JSON.stringify(context)}\n\nUser request: ${prompt}\n\nProvide actionable insights or suggestions.`,
        model: 'automatic'
      });
      setResult(response);
      if (onResult) onResult(response);
    } catch (error) {
      toast.error('AI request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-500" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          placeholder="Ask AI to analyze candidates, suggest matches, draft emails, etc..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[80px] text-sm"
        />
        <Button onClick={handleAsk} disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? 'Processing...' : 'Ask AI'}
        </Button>
        {result && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
}