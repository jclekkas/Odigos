interface DirectAnswerBlockProps {
  question: string;
  answer: string;
}

export default function DirectAnswerBlock({ question, answer }: DirectAnswerBlockProps) {
  return (
    <div className="border-l-4 border-primary bg-primary/5 rounded-r-md pl-4 pr-3 py-3 my-6" data-testid="block-direct-answer">
      <p className="text-sm font-semibold text-foreground mb-1.5">{question}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{answer}</p>
    </div>
  );
}
