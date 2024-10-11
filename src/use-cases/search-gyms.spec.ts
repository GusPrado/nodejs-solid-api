import { expect, describe, it, beforeEach } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { SearchGymUseCase } from './search-gyms'

let gymsRepository: InMemoryGymsRepository
let sut: SearchGymUseCase

describe('Search Gym use case', () => {
  beforeEach(() => {
    gymsRepository = new InMemoryGymsRepository()
    sut = new SearchGymUseCase(gymsRepository)
  })

  it('should be able search gyms by title', async () => {
    await gymsRepository.create({
      title: 'JS Gym',
      description: null,
      phone: null,
      latitude: -30.1006633,
      longitude: -51.3155661,
    })

    await gymsRepository.create({
      title: 'TS Gym',
      description: null,
      phone: null,
      latitude: -30.1006632,
      longitude: -51.3155664,
    })

    const { gyms } = await sut.execute({
      query: 'JS',
      page: 1,
    })

    expect(gyms).toHaveLength(1)
    expect(gyms).toEqual([expect.objectContaining({ title: 'JS Gym' })])
  })

  it('should be able to fetch paginated gyms search', async () => {
    for (let i = 1; i <= 22; i++) {
      await gymsRepository.create({
        title: `TS GYM ${i}`,
        description: null,
        phone: null,
        latitude: -30.1006632,
        longitude: -51.3155664,
      })
    }

    const { gyms } = await sut.execute({
      query: 'TS',
      page: 2,
    })

    expect(gyms).toHaveLength(2)
    expect(gyms).toEqual([
      expect.objectContaining({ title: 'TS GYM 21' }),
      expect.objectContaining({ title: 'TS GYM 22' }),
    ])
  })
})
