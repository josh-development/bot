import type { ButtonComponent } from "../../deps.ts";

export class Buttons {
  constructor() {
    this.type = 1;
    this.components = [];
  }
  type: 1;
  components: ButtonComponent[] = [];

  addComponent(component: ButtonComponent) {
    this.components.push(component);
    return this;
  }
}
