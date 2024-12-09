jest.mock('../prisma/mockPrismaClient', () => {
  return {
    MockPrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Test User' }])
      },
      post: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, title: 'Test Post' }]),
        update: jest.fn().mockResolvedValue({ id: 1, title: 'Updated Post' })
      },
      challenge: {
        findMany: jest.fn().mockResolvedValue([{ id: 1, name: 'Test Challenge' }])
      },
      memberChallenge: {
        update: jest.fn().mockResolvedValue({ id: 1, status: 'Updated' })
      }
    }))
  }
})

// Your test cases here
