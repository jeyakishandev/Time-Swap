import { Test, TestingModule } from '@nestjs/testing';
import { BookingsController } from './bookings.controller';
import { BookingsService } from './bookings.service';

describe('BookingsController', () => {
  let controller: BookingsController;
  let service: BookingsService;

  beforeEach(async () => {
    const mockBookingsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByUser: jest.fn(),
      findOne: jest.fn(),
      confirm: jest.fn(),
      cancel: jest.fn(),
      complete: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookingsController],
      providers: [
        {
          provide: BookingsService,
          useValue: mockBookingsService,
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    service = module.get<BookingsService>(BookingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a booking', async () => {
    const createBookingDto = {
      serviceId: 'service-id',
      hours: 2,
      notes: 'Test booking',
    };
    const mockBooking = { id: 'booking-id', ...createBookingDto } as any;
    const mockRequest = { user: { sub: 'test-user-id' } };

    jest.spyOn(service, 'create').mockResolvedValue(mockBooking);

    const result = await controller.create(createBookingDto, mockRequest);
    expect(result).toEqual(mockBooking);
    expect(service.create).toHaveBeenCalledWith(createBookingDto, 'test-user-id');
  });

  it('should find all bookings', async () => {
    const mockBookings = [
      { id: '1', status: 'PENDING' },
      { id: '2', status: 'CONFIRMED' },
    ] as any;

    jest.spyOn(service, 'findAll').mockResolvedValue(mockBookings);

    const result = await controller.findAll();
    expect(result).toEqual(mockBookings);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find my bookings', async () => {
    const mockBookings = [
      { id: '1', clientId: 'test-user-id' },
      { id: '2', providerId: 'test-user-id' },
    ] as any;
    const mockRequest = { user: { sub: 'test-user-id' } };

    jest.spyOn(service, 'findByUser').mockResolvedValue(mockBookings);

    const result = await controller.findMyBookings(mockRequest);
    expect(result).toEqual(mockBookings);
    expect(service.findByUser).toHaveBeenCalledWith('test-user-id');
  });

  it('should find one booking', async () => {
    const mockBooking = { id: 'booking-id', status: 'PENDING' } as any;
    const bookingId = 'booking-id';

    jest.spyOn(service, 'findOne').mockResolvedValue(mockBooking);

    const result = await controller.findOne(bookingId);
    expect(result).toEqual(mockBooking);
    expect(service.findOne).toHaveBeenCalledWith(bookingId);
  });

  it('should confirm a booking', async () => {
    const mockBooking = { id: 'booking-id', status: 'CONFIRMED' } as any;
    const bookingId = 'booking-id';
    const mockRequest = { user: { sub: 'test-user-id' } };

    jest.spyOn(service, 'confirm').mockResolvedValue(mockBooking);

    const result = await controller.confirm(bookingId, mockRequest);
    expect(result).toEqual(mockBooking);
    expect(service.confirm).toHaveBeenCalledWith(bookingId, 'test-user-id');
  });

  it('should cancel a booking', async () => {
    const mockBooking = { id: 'booking-id', status: 'CANCELLED' } as any;
    const bookingId = 'booking-id';
    const mockRequest = { user: { sub: 'test-user-id' } };

    jest.spyOn(service, 'cancel').mockResolvedValue(mockBooking);

    const result = await controller.cancel(bookingId, mockRequest);
    expect(result).toEqual(mockBooking);
    expect(service.cancel).toHaveBeenCalledWith(bookingId, 'test-user-id');
  });

  it('should complete a booking', async () => {
    const mockBooking = { id: 'booking-id', status: 'COMPLETED' } as any;
    const bookingId = 'booking-id';
    const mockRequest = { user: { sub: 'test-user-id' } };

    jest.spyOn(service, 'complete').mockResolvedValue(mockBooking);

    const result = await controller.complete(bookingId, mockRequest);
    expect(result).toEqual(mockBooking);
    expect(service.complete).toHaveBeenCalledWith(bookingId, 'test-user-id');
  });

  it('should remove a booking', async () => {
    const mockBooking = { id: 'booking-id' } as any;
    const bookingId = 'booking-id';
    const mockRequest = { user: { sub: 'test-user-id' } };

    jest.spyOn(service, 'remove').mockResolvedValue(mockBooking);

    const result = await controller.remove(bookingId, mockRequest);
    expect(result).toEqual(mockBooking);
    expect(service.remove).toHaveBeenCalledWith(bookingId, 'test-user-id');
  });
});