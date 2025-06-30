export class Message {
  constructor(
    public readonly _id: string,
    public readonly chatId: string,
    public readonly role: 'user' | 'ia',
    public readonly content: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
