export type Secret = {
  id: string;
  content: string;
  allowReplies: boolean;
  replies: string[];
  timestamp: Date;
};

// In-memory store (temporary)
const secrets: Secret[] = [];

export const addSecret = (secret: Omit<Secret, 'id'>): Secret => {
  const newSecret: Secret = {
    id: Date.now().toString(),
    ...secret,
  };
  secrets.push(newSecret);
  return newSecret;
};

export const getAllSecrets = (): Secret[] => {
  return secrets;
};
