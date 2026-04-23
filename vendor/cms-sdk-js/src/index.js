/**
 * Sakha CMS JavaScript SDK
 * Project-scoped API client — initialized with API key+secret or JWT token.
 */

import { HttpClient, SdkError } from './client.js';
import { BlogModule } from './modules/blog.js';
import { EventsModule } from './modules/events.js';
import { DonationsModule } from './modules/donations.js';
import { TeamModule } from './modules/team.js';
import { MediaModule } from './modules/media.js';
import { ProductsModule } from './modules/products.js';
import { OrdersModule } from './modules/orders.js';
import { InvoicesModule } from './modules/invoices.js';
import { TransactionsModule } from './modules/transactions.js';
import { ServicesModule } from './modules/services.js';
import { AppointmentsModule } from './modules/appointments.js';
import { ShipmentsModule } from './modules/shipments.js';
import { VendorsModule } from './modules/vendors.js';
import { BannersModule } from './modules/banners.js';
import { UsersModule } from './modules/users.js';
import { AnalyticsModule } from './modules/analytics.js';
import { UserGroupsModule } from './modules/userGroups.js';
import { CustomModuleFactory, CustomModule } from './modules/custom.js';

export class SakhaCMS {
  constructor(config = {}) {
    this._client = new HttpClient(config);
    this._customFactory = new CustomModuleFactory(this._client);
    this._customCache = {};

    this.blog = new BlogModule(this._client);
    this.events = new EventsModule(this._client);
    this.donations = new DonationsModule(this._client);
    this.team = new TeamModule(this._client);
    this.media = new MediaModule(this._client);
    this.products = new ProductsModule(this._client);
    this.orders = new OrdersModule(this._client);
    this.invoices = new InvoicesModule(this._client);
    this.transactions = new TransactionsModule(this._client);
    this.services = new ServicesModule(this._client);
    this.appointments = new AppointmentsModule(this._client);
    this.shipments = new ShipmentsModule(this._client);
    this.vendors = new VendorsModule(this._client);
    this.banners = new BannersModule(this._client);
    this.users = new UsersModule(this._client);
    this.analytics = new AnalyticsModule(this._client);
    this.userGroups = new UserGroupsModule(this._client);
  }

  /**
   * Access a custom module (SurrealDB-backed). Any table name is valid.
   * Usage: cms.custom('reviews').list({ page: 1 })
   */
  custom(table) {
    if (!this._customCache[table]) {
      this._customCache[table] = new CustomModule(this._client, table);
    }
    return this._customCache[table];
  }

  /** List all custom tables for this project */
  customTables() { return this._customFactory.tables(); }

  setHeader(key, value) { this._client.setHeader(key, value); }
  setProjectId(projectId) { this._client.setHeader('X-Project-Id', projectId); }
  clearProjectId() { this._client.setHeader('X-Project-Id', null); }
  raw() { return this._client; }
}

export { HttpClient, SdkError };
export default SakhaCMS;
