import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { usePollContext } from '../../context/PollContext';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';
import { validateQuestion, validateOption } from '../../utils/validators';
import { MAX_QUESTION_LENGTH, DEFAULT_POLL_DURATION, MIN_OPTIONS } from '../../utils/constants';

const CreatePollForm = () => {
  const [question, setQuestion] = useState('');
  const [duration, setDuration] = useState(DEFAULT_POLL_DURATION);
  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { sessionId } = useSessionContext();
  const { setActivePoll } = usePollContext();

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleOptionChange = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleCorrectAnswer = (index: number) => {
    const newOptions = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const questionError = validateQuestion(question);
    if (questionError) {
      setErrors({ question: questionError });
      return;
    }

    const validOptions = options.filter(opt => opt.text.trim());
    if (validOptions.length < MIN_OPTIONS) {
      setErrors({ options: `At least ${MIN_OPTIONS} options are required` });
      return;
    }

    validOptions.forEach((opt, index) => {
      const error = validateOption(opt.text);
      if (error) {
        setErrors({ [`option-${index}`]: error });
      }
    });

    if (Object.keys(errors).length > 0) return;

    try {
      setIsSubmitting(true);
      const response = await api.polls.create({
        question: question.trim(),
        options: validOptions,
        duration,
        sessionId,
        createdBy: sessionId || '',
      });

      if (response.data.poll) {
        setActivePoll(response.data.poll);
        navigate('/teacher/dashboard');
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Failed to create poll' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4">
            <span className="text-white font-semibold">+ Intervue Poll</span>
          </div>
          <h1 className="text-4xl font-bold text-[#373737] mb-2">Let's Get Started.</h1>
          <p className="text-[#6E6E6E]">
            you'll have the ability to create and manage polls, ask questions, and monitor your students' responses in real-time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[#373737] font-semibold">Enter your question</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="px-3 py-1 border border-[#F2F2F2] rounded text-[#373737]"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
                <option value={120}>120 seconds</option>
              </select>
            </div>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full px-4 py-3 bg-[#F2F2F2] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-[#373737] resize-none"
              rows={4}
              placeholder="Enter your question..."
              maxLength={MAX_QUESTION_LENGTH}
            />
            <div className="flex justify-end mt-1">
              <span className={`text-sm ${question.length > MAX_QUESTION_LENGTH ? 'text-[#F44336]' : 'text-[#6E6E6E]'}`}>
                {question.length}/{MAX_QUESTION_LENGTH}
              </span>
            </div>
            {errors.question && <p className="mt-1 text-sm text-[#F44336]">{errors.question}</p>}
          </div>

          <div>
            <label className="block text-[#373737] font-semibold mb-4">Edit Options</label>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#7765DA] text-white flex items-center justify-center font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 px-4 py-2 bg-[#F2F2F2] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-[#373737]"
                    placeholder={`Option ${index + 1}`}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#373737]">Is it Correct?</span>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={option.isCorrect}
                          onChange={() => handleCorrectAnswer(index)}
                          className="text-[#7765DA]"
                        />
                        <span className="text-sm text-[#373737]">Yes</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct-${index}`}
                          checked={!option.isCorrect}
                          onChange={() => {}}
                          className="text-[#7765DA]"
                        />
                        <span className="text-sm text-[#373737]">No</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-4 px-4 py-2 bg-[#7765DA] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
            >
              <span>+</span> Add More option
            </button>
            {errors.options && <p className="mt-2 text-sm text-[#F44336]">{errors.options}</p>}
          </div>

          {errors.submit && <p className="text-sm text-[#F44336]">{errors.submit}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 rounded-lg text-white font-semibold transition-all ${
                isSubmitting
                  ? 'bg-[#6E6E6E] cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] hover:opacity-90 cursor-pointer'
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Ask Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePollForm;

