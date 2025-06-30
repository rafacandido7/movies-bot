export class Chat {
  constructor(
    public readonly _id: string,
    public readonly title: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}
}
