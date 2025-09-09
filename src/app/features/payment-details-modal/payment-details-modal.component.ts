import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal fade" id="paymentDetailsModal" tabindex="-1" aria-labelledby="paymentDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="paymentDetailsModalLabel">Payment Information</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Bank Account Details</h6>
                <p><strong>Account Name:</strong> Simanics Global Solutions</p>
                <p><strong>Account Number:</strong> 47102733843</p>
                <p><strong>Bank Name:</strong> State Bank of India</p>
                <p><strong>IFSC Code:</strong> SBIN0013760</p>
                <p><strong>Branch:</strong> Chandlodia, Ahmedabad</p>
              </div>
              <div class="col-md-6">
                <h6>UPI Details</h6>
                <img src="Simanics QR.png" height="170px">
                <p><strong>UPI ID:</strong> 8347878904&#64;pthdfc</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PaymentDetailsModalComponent {}
