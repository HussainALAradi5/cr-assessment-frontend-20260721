import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CrApiService } from '../../api/cr-api.service';
import { SessionService } from '../../session/session.service';
import { CrDetail, TimelineEntry } from '../../models/cr.models';
import { idle, loading, ViewState } from '../../common/view-state';
import { computeDiff, DiffRow } from '../diff.util';
import { formatMoney } from '../../common/money.util';

/**
 * Change Request DETAIL page: loads a CR and renders the diff/preview, the approval timeline, and
 * permission-aware Approve/Reject actions. `load`, the diff binding, and the template skeleton are
 * provided; the timeline ordering, permission gating, actions, and reject validation are yours.
 */
@Component({
	selector: 'app-cr-detail',
	standalone: true,
	imports: [CommonModule, ReactiveFormsModule],
	templateUrl: './cr-detail.component.html',
})
export class CrDetailComponent implements OnInit {
	@Input() id!: string;

	state: ViewState<CrDetail> = idle();
	submitting = false;
	actionError?: string;
	// TODO: add validation so the form is invalid until a reason is entered.
	rejectControl = new FormControl('', { nonNullable: true });

	constructor(private readonly api: CrApiService, private readonly session: SessionService) {}

	ngOnInit(): void {
		void this.load();
	}

	async load(): Promise<void> {
		this.state = loading();
		this.actionError = undefined;
		try {
			const detail = await this.api.getChangeRequest(this.session.user, this.id);
			this.state = { status: 'loaded', data: detail };
		} catch (err) {
			this.state = { status: 'error', data: null, error: (err as Error).message };
		}
	}

	get detail(): CrDetail | null {
		return this.state.data;
	}

	get diff(): DiffRow[] {
		return this.detail ? computeDiff(this.detail.baselineLineItems, this.detail.proposedLineItems) : [];
	}

	/** Approval timeline, oldest-first. */
	get timeline(): TimelineEntry[] {
		// TODO: return the audit entries ordered chronologically (oldest first).
		const audit = this.detail?.audit ?? [];
		return [...audit].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
	}

	get hasApprove(): boolean {
		return this.session.user?.policies.includes('cr_a_o') ?? false;
	}

	/** Whether the current user may approve the loaded CR. */
	get canApprove(): boolean {
		// NOTE: this only looks at the CR status. The UI must also respect the user's permissions.
		return this.detail?.status === 'PENDING_APPROVAL' && this.hasApprove;
	}

	get canReject(): boolean {
		return this.detail?.status === 'PENDING_APPROVAL' && this.hasApprove;
	}

	fmt(amount: number): string {
		return this.detail ? formatMoney(amount, this.detail.currency) : String(amount);
	}

	async approve(): Promise<void> {
		// TODO: perform the approve action through the API and reflect the outcome in the view.
		const invalid = !this.canApprove || this.submitting;
		if (invalid) return;
		this.submitting = true;
		try {
			const at = new Date().toISOString();
			const updated = await this.api.approve(this.session.user, this.id, at);
			this.state = { status: 'loaded', data: updated };
		} catch (err) {
			this.actionError = (err as Error).message;
		}
		this.submitting = false;
	}

	async reject(): Promise<void> {
		// TODO: require a valid rejectControl, then perform the reject action through the API and
		//       reflect the outcome in the view.
		if (!this.canReject || this.submitting) return;
		if (this.rejectControl.invalid) {
			this.rejectControl.markAsTouched();
			return;
		}

		this.submitting = true;
		this.actionError = undefined;
		try {
			const updated = await this.api.reject(this.session.user, this.id, new Date().toISOString(), this.rejectControl.value);
			this.state = { status: 'loaded', data: updated };
			this.rejectControl.reset();
		} catch (err) {
			this.actionError = (err as Error).message;
		}
		this.submitting = false;
	}
}
