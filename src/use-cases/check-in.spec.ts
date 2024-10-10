import { expect, describe, it, beforeEach, vi, afterEach } from 'vitest'
import { CheckInUseCase } from './check-in'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { Decimal } from '@prisma/client/runtime/library'

let usersRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(usersRepository, gymsRepository)

    gymsRepository.items.push({
      id: 'gym-01',
      title: 'JS Gym',
      description: '',
      phone: '',
      latitude: new Decimal(-30.1006633),
      longitude: new Decimal(-51.3155661),
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -30.1006633,
      userLongitude: -51.3155661,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in twice in a day', async () => {
    vi.setSystemTime(new Date(2024, 0, 1, 0, 1, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -30.1006633,
      userLongitude: -51.3155661,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -30.1006633,
        userLongitude: -51.3155661,
      }),
    ).rejects.toBeInstanceOf(Error)
  })

  it('should be able to check in twice on different days', async () => {
    vi.setSystemTime(new Date(2024, 0, 1, 0, 1, 0))

    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -30.1006633,
      userLongitude: -51.3155661,
    })

    vi.setSystemTime(new Date(2024, 0, 2, 0, 1, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -30.1006633,
      userLongitude: -51.3155661,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })

  it('should not be able to check in a distant gym', async () => {
    gymsRepository.items.push({
      id: 'gym-02',
      title: 'JS Gym2',
      description: '',
      phone: '',
      latitude: new Decimal(-30.0442607),
      longitude: new Decimal(-51.3198905),
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-02',
        userId: 'user-01',
        userLatitude: -30.1006633,
        userLongitude: -51.3155661,
      }),
    ).rejects.toBeInstanceOf(Error)
  })
})
