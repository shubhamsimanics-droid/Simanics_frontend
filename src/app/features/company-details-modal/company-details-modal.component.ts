import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-details-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Modal -->
    <div class="modal fade" id="companyDetailsModal" tabindex="-1" aria-labelledby="companyDetailsModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="companyDetailsModalLabel">Company Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-6">
                <h6>Company Information</h6>
                <p><strong>Name:</strong> Simanics Solutions</p>
                <p><strong>Industry:</strong> Washroom Automation & Industrial Solutions</p>
                <p><strong>Headquarters:</strong> Ahmedabad, India</p>
                <p><strong>GSTIN/UIN</strong> 24CDWPR8789J1Z7</p>
              </div>
              <div class="col-md-6">
                <h6>Contact Information</h6>
                <p><strong>Email:</strong> simanicsglobal&#64;gmail.com</p>
                <p><strong>Phone:</strong> +91 9426467608</p>
                <p><strong>Global Presence:</strong> US, Spain, Singapore, Malaysia</p>
              </div>
            </div>
            <div class="mt-3">
              <h6>About Us</h6>
              <p>Simanics Solutions is a leading provider of innovative washroom automation systems and industrial entrance solutions. We pride ourselves on delivering high-quality products and exceptional service to our clients worldwide.</p>
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
export class CompanyDetailsModalComponent {}
