import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of, switchMap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../../core/services/loading/toast.service';
import { RoomsService } from '../../core/services/admin/rooms.service';
import { UsersService } from '../../core/services/admin/users.service';
import { BookingsService } from '../../core/services/admin/bookings.service';
import { HotelService } from '../../core/services/admin/hotel.service';
import { ImageService } from '../../core/services/admin/image.service';
import { Hotel } from '../../core/services/admin/models/hotel.model';
import { Room, RoomType } from '../../core/services/admin/models/room.model';
import { User } from '../../core/services/admin/models/user.model';
import { Booking } from '../../core/services/admin/models/booking.model';

type AdminTab = 'hoteles' | 'habitaciones' | 'usuarios' | 'reservas';
type ModalMode = 'add' | 'edit';

interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss',
})
export class AdminComponent implements OnInit {

  private fb = inject(FormBuilder);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef); // CORRECCIÓN: Descomentado

  private roomsService = inject(RoomsService);
  private usersService = inject(UsersService);
  private bookingsService = inject(BookingsService);
  private hotelsService = inject(HotelService);
  private imageService = inject(ImageService);

  activeTab = signal<AdminTab>('hoteles');

  // Lista completa de hoteles para el dropdown del formulario de habitaciones
  hotelsList = signal<Hotel[]>([]);

  // Datos
  hoteles = signal<Hotel[]>([]);
  habitaciones = signal<Room[]>([]);
  usuarios = signal<User[]>([]);
  reservas = signal<Booking[]>([]);

  // Paginación
  page = signal(1);
  total = signal(0);
  limit = 10;

  get totalPages(): number { return Math.ceil(this.total() / this.limit); }

  get pageFrom(): number { return Math.min((this.page() - 1) * this.limit + 1, this.total()); }
  get pageTo(): number { return Math.min(this.page() * this.limit, this.total()); }

  // Modal
  showModal = signal(false);
  modalMode = signal<ModalMode>('add');
  editingRow = signal<Room | Hotel | null>(null);
  saving = signal(false);

  // Confirmación borrado
  confirmDeleteId = signal<number | null>(null);

  // Formulario habitación
  roomForm = this.fb.nonNullable.group({
    id_hotel: [0, [Validators.required, Validators.min(1)]],
    room_number: ['', Validators.required],
    type: 'individual' as RoomType,
    capacity: [1, [Validators.required, Validators.min(1)]],
    price_per_night: [0, [Validators.required, Validators.min(0.01)]],
    description: '',
    status: 'available' as Room['status'],
  });

  // Formulario hotel
  hotelForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    address: ['', Validators.required],
    city: ['', Validators.required],
    phone: [''],
    email: [''],
    description: [''],
  });

  // URLs de imágenes (campo dinámico del modal)
  imageUrls = signal<string[]>(['']);

  addImageUrl(): void { this.imageUrls.update(list => [...list, '']); }

  removeImageUrl(index: number): void {
    this.imageUrls.update(list => list.filter((_, i) => i !== index));
  }

  updateImageUrl(index: number, value: string): void {
    this.imageUrls.update(list => list.map((v, i) => i === index ? value : v));
  }

  readonly roomTypes = ['individual', 'doble', 'suite', 'studio'];
  readonly roomStatuses = ['available', 'occupied', 'maintenance'];

  formatDate(value: string): string {
    if (!value) return '—';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const day   = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year  = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  }

  hotelNameById(id: number): string {
    return this.hotelsList().find(h => h.id_hotel === id)?.name ?? '—';
  }

  isRoomInvalid(field: string): boolean {
    const ctrl = this.roomForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  isHotelInvalid(field: string): boolean {
    const ctrl = this.hotelForm.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  // Lifecycle
  ngOnInit(): void {
    this.loadTab('hoteles');
    this.hotelsService.getAllForSelect()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: res => this.hotelsList.set(res.data) });
  }

  // Tabs
  selectTab(tab: AdminTab): void {
    this.activeTab.set(tab);
    this.page.set(1);
    this.confirmDeleteId.set(null);
    this.loadTab(tab);
  }

  // Paginación
  prevPage(): void {
    if (this.page() > 1) { this.page.update(p => p - 1); this.loadTab(this.activeTab()); }
  }
  nextPage(): void {
    if (this.page() < this.totalPages) { this.page.update(p => p + 1); this.loadTab(this.activeTab()); }
  }

  // Modal-abrir
  openAddModal(): void {
    this.modalMode.set('add');
    this.editingRow.set(null);
    this.imageUrls.set(['']);
    this.roomForm.reset({ type: 'individual', capacity: 1, price_per_night: 0, status: 'available' });
    this.hotelForm.reset();
    this.showModal.set(true);
  }

  openEditModal(row: any): void {
    this.modalMode.set('edit');
    this.editingRow.set(row);
    if (this.activeTab() === 'habitaciones') {
      this.roomForm.patchValue({
        id_hotel: row.id_hotel, room_number: row.room_number,
        type: row.type, capacity: row.capacity,
        price_per_night: row.price_per_night,
        description: row.description ?? '', status: row.status,
      });
    } else if (this.activeTab() === 'hoteles') {
      this.hotelForm.patchValue({
        name: row.name, address: row.address, city: row.city,
        phone: row.phone ?? '', email: row.email ?? '',
        description: row.description ?? '',
      });
    }
    this.showModal.set(true);
  }

  closeModal(): void { this.showModal.set(false); this.imageUrls.set(['']); }

  // Modal-guardar
  saveModal(): void {
    if (this.saving()) return;

    const isEdit = this.modalMode() === 'edit';
    const tab = this.activeTab();
    const row = this.editingRow();

    // CORRECCIÓN: La condición anterior rompía la edición de hoteles
    if (isEdit && !row) return;

    const config = {
      habitaciones: {
        form: this.roomForm,
        create: () => this.roomsService.create(this.roomForm.getRawValue()),
        update: () => this.roomsService.update(
          (row as Room).id_room, // Casteo seguro
          this.roomForm.getRawValue()
        ),
        success: ['Habitación creada', 'Habitación actualizada']
      },
      hoteles: {
        form: this.hotelForm,
        create: () => this.hotelsService.create(this.hotelForm.getRawValue()),
        update: () => this.hotelsService.update(
          (row as Hotel).id_hotel, // Casteo seguro
          this.hotelForm.getRawValue()
        ),
        success: ['Hotel creado', 'Hotel actualizado']
      }
    } as const;

    const current = config[tab as 'habitaciones' | 'hoteles'];
    if (!current) return;

    if (current.form.invalid) {
      current.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const request$ = (isEdit ? current.update() : current.create()) as any;

    request$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((res: any) => {
          const urls = this.imageUrls().map(u => u.trim()).filter(Boolean);
          if (!urls.length) return of(null);

          const entityId = isEdit
            ? (tab === 'habitaciones' ? (row as Room).id_room : (row as Hotel).id_hotel)
            : (tab === 'habitaciones' ? res.id_room : res.id_hotel);

          const saves$ = urls.map(url =>
            tab === 'habitaciones'
              ? this.imageService.saveUrl({ id_room: entityId, url })
              : this.imageService.saveUrl({ id_hotel: entityId, url })
          );

          return forkJoin(saves$).pipe(catchError(() => of(null)));
        })
      )
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTab(tab);
          this.toast.show(isEdit ? current.success[1] : current.success[0], 'success');
        },
        error: () => this.saving.set(false),
      });
  }

  // Borrar
  askDelete(id: number): void { this.confirmDeleteId.set(id); }
  cancelDelete(): void { this.confirmDeleteId.set(null); }

  confirmDelete(): void {
    const id = this.confirmDeleteId();

    if (id == null) return;

    const map = {
      hoteles: () => this.hotelsService.delete(id),
      habitaciones: () => this.roomsService.delete(id),
      usuarios: () => this.usersService.delete(id),
      reservas: () => this.bookingsService.delete(id),
    };

    const request$ = map[this.activeTab()]?.() as any;

    if (!request$) return;

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.confirmDeleteId.set(null);
          this.loadTab(this.activeTab());
          this.toast.show('Registro eliminado correctamente', 'success');
        },
        error: () => this.confirmDeleteId.set(null),
      });
  }

  // Carga de datos
  private loadTab(tab: AdminTab): void {

    const map = {
      hoteles: () => this.hotelsService.getAll(this.page(), this.limit),
      habitaciones: () => this.roomsService.getAll(this.page(), this.limit),
      usuarios: () => this.usersService.getAll(this.page(), this.limit),
      reservas: () => this.bookingsService.getAll(this.page(), this.limit),
    };

    const request$ = map[tab]?.() as any;

    if (!request$) return;

    request$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res: PaginatedResponse<any>) => {
          this.total.set(res.pagination.total);

          const dataMap = {
            hoteles: () => this.hoteles.set(res.data),
            habitaciones: () => this.habitaciones.set(res.data),
            usuarios: () => this.usuarios.set(res.data),
            reservas: () => this.reservas.set(res.data),
          };

          dataMap[tab]?.();
        },
        error: () => this.total.set(0),
      });
  }

  // Columnas
  hotelColumns = ['id_hotel', 'name', 'city', 'address', 'phone'];
  roomColumns = ['id_room', 'hotel_name', 'room_number', 'type', 'capacity', 'price_per_night', 'status'];
  userColumns = ['id_user', 'first_name', 'last_name', 'email', 'role'];
  reservaColumns = ['id_reservation', 'hotel_name', 'email', 'type', 'check_in_date', 'check_out_date', 'reservation_status'];

  get activeColumns(): string[] {
    return ({
      hoteles: this.hotelColumns, habitaciones: this.roomColumns,
      usuarios: this.userColumns, reservas: this.reservaColumns
    })[this.activeTab()];
  }

  get activeData(): any[] {
    return ({
      hoteles: this.hoteles(), habitaciones: this.habitaciones(),
      usuarios: this.usuarios(), reservas: this.reservas()
    })[this.activeTab()];
  }

  get activeIdField(): string {
    return ({
      hoteles: 'id_hotel', habitaciones: 'id_room',
      usuarios: 'id_user', reservas: 'id_reservation'
    })[this.activeTab()];
  }

  get canAdd(): boolean { return ['hoteles', 'habitaciones'].includes(this.activeTab()); }
  get canEdit(): boolean { return ['hoteles', 'habitaciones'].includes(this.activeTab()); }

  private readonly labelMap = new Map<string, string>([
    ['id_hotel', 'ID'], ['name', 'Nombre'], ['address', 'Dirección'],
    ['city', 'Ciudad'], ['phone', 'Teléfono'],
    ['id_room', 'ID'], ['hotel_name', 'Hotel'], ['room_number', 'Nº hab.'], ['type', 'Tipo'],
    ['capacity', 'Cap.'], ['price_per_night', 'Precio/noche'], ['status', 'Estado'],
    ['id_user', 'ID'], ['first_name', 'Nombre'], ['last_name', 'Apellido'],
    ['email', 'Email'], ['role', 'Rol'],
    ['id_reservation', 'ID'], ['check_in_date', 'Check-in'],
    ['check_out_date', 'Check-out'], ['reservation_status', 'Estado'],
    ['type', 'Habitación'],
  ]);

  columnLabel(col: string): string {
    if (this.activeTab() === 'reservas') {
      if (col === 'hotel_name') return 'Hotel';
      if (col === 'email')      return 'Usuario';
      if (col === 'type')       return 'Habitación';
    }
    return this.labelMap.get(col) ?? col;
  }
}
