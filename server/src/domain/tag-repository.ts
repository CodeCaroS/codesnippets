export interface TagRepository {
  listAll(): Promise<Array<{ id: string; name: string }>>;
}
