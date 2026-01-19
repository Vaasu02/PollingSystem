import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { validateName } from '../../utils/validators';

const NameInput = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { createSession } = useSessionContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateName(name);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setIsLoading(true);
      await createSession({
        userType: 'student',
        userName: name.trim(),
      });
      navigate('/student/waiting');
    } catch (err: any) {
      setError(err.message || 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] px-4 py-2 rounded-full flex items-center gap-2">
            <img src="/Vector.svg" alt="" className="w-4 h-4" />
            <span className="text-white font-semibold">Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#373737] text-center mb-4">
          Let's Get Started.
        </h1>

        <p className="text-[#6E6E6E] text-center mb-8">
          If you're a student, you'll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[#373737] font-semibold mb-2">
              Enter your Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F2F2F2] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#7765DA] text-[#373737]"
              placeholder="Vasu K"
              disabled={isLoading}
            />
            {error && (
              <p className="mt-2 text-sm text-[#F44336]">{error}</p>
            )}
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className={`px-8 py-3 rounded-lg text-white font-semibold transition-all ${
                isLoading || !name.trim()
                  ? 'bg-[#6E6E6E] cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] hover:opacity-90 cursor-pointer'
              }`}
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NameInput;

