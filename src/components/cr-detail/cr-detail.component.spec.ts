import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrDetailComponent } from './cr-detail.component';
import { SessionService } from '../../session/session.service';
import { users } from '../../api/fixtures';
import { ReqUser } from '../../models/cr.models';
import { CrApiService } from '../../api/cr-api.service';

const flush = () => new Promise((r) => setTimeout(r, 0));

async function render(user: ReqUser, id: string): Promise<ComponentFixture<CrDetailComponent>> {
	TestBed.configureTestingModule({
		imports: [CrDetailComponent],
		providers: [{ provide: SessionService, useValue: { user } }],
	});
	await TestBed.compileComponents();
	const fixture = TestBed.createComponent(CrDetailComponent);
	fixture.componentInstance.id = id;
	fixture.detectChanges(); // ngOnInit -> load()
	await flush(); // let the mock API resolve
	fixture.detectChanges(); // render the loaded state
	return fixture;
}

describe('CrDetailComponent', () => {
	it('loads and renders the change request title', async () => {
		const fixture = await render(users.approver, 'CR-1');
		expect(fixture.nativeElement.querySelector('.cr-detail__header h2').textContent).toContain('Add 1 unit of SKU-A');
	});

	it('disables Approve for a read-only viewer on a pending CR', async () => {
		const fixture = await render(users.viewer, 'CR-1'); // viewer: cr_r_o only; CR-1 is PENDING_APPROVAL
		const approveBtn: HTMLButtonElement = fixture.nativeElement.querySelector('.cr-actions__approve');
		expect(approveBtn.disabled).toBe(true);
	});
});


it('blocks rejection when the reason field is empty and marks it as touched', async () => {
		const fixture = await render(users.approver, 'CR-1');
		const component = fixture.componentInstance;

		// Set empty value and trigger reject
		component.rejectControl.setValue('');
		await component.reject();

		expect(component.rejectControl.invalid).toBe(true);
		expect(component.rejectControl.touched).toBe(true);
	});

	it('orders the approval timeline chronologically (oldest first)', async () => {
		const fixture = await render(users.approver, 'CR-1');
		const timeline = fixture.componentInstance.timeline;

		// Verify that each entry's timestamp is less than or equal to the next
		for (let i = 0; i < timeline.length - 1; i++) {
			const currentTime = new Date(timeline[i].at).getTime();
			const nextTime = new Date(timeline[i + 1].at).getTime();
			expect(currentTime).toBeLessThanOrEqual(nextTime);
		}
	});

	it('handles API error states gracefully when an action fails', async () => {
		const fixture = await render(users.approver, 'CR-1');
		const component = fixture.componentInstance;
		
		// Force the mock API to fail on the next call
		// (Accessing the injected CrApiService via TestBed)
		const api = TestBed.inject(CrApiService);
		api.failNext = true;

		await component.approve();

		expect(component.actionError).toBeDefined();
		expect(component.submitting).toBe(false);
	});