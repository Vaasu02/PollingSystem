export const validateQuestion = (question: string): string | null => {
  if (!question || question.trim().length === 0) {
    return 'Question is required';
  }
  if (question.length > 100) {
    return 'Question must be 100 characters or less';
  }
  return null;
};

export const validateOption = (option: string): string | null => {
  if (!option || option.trim().length === 0) {
    return 'Option text is required';
  }
  return null;
};

export const validateName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  return null;
};

