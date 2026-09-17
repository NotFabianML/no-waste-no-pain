import type { BudgetMode } from '../data/budget';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const percentFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });

const money = (value: number) => moneyFormatter.format(value);
const percent = (value: number) => `${percentFormatter.format(value)}%`;
const tableCell = (value: string) => value.replaceAll('|', '\\|');

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing required element: ${selector}`);
  return element;
}

function categoryMarkup(name = 'New category', value = 0, mode: BudgetMode = 'amount') {
  return `<div class="category-row" data-mode="${mode}">
    <button class="category-toggle active" type="button" aria-pressed="true" aria-label="Disable ${name}"></button>
    <input class="category-name" value="${name}" aria-label="Category name">
    <div class="value-control">
      <div class="value-main">
        <input class="category-value" type="number" value="${value}" min="0" inputmode="decimal" aria-label="${name} budget">
        <div class="mode-switch" aria-label="Budget type">
          <button class="unit-btn ${mode === 'amount' ? 'active' : ''}" data-mode="amount" type="button" aria-label="Use money amount">$</button>
          <button class="unit-btn ${mode === 'percent' ? 'active' : ''}" data-mode="percent" type="button" aria-label="Use percentage">%</button>
        </div>
      </div>
      <span class="equivalent" aria-live="polite"></span>
    </div>
    <button class="remove-category" type="button" aria-label="Remove ${name}">×</button>
  </div>`;
}

export function initBudgetPlanner() {
  const plans = required<HTMLElement>(document, '#plans');
  const income = required<HTMLInputElement>(document, '#income');
  const status = required<HTMLElement>(document, '#status');

  function calculatePlan(plan: Element) {
    const total = Number(income.value) || 0;
    let allocated = 0;

    plan.querySelectorAll<HTMLElement>('.category-row').forEach((row) => {
      const value = Number(required<HTMLInputElement>(row, '.category-value').value) || 0;
      const enabled = required<HTMLButtonElement>(row, '.category-toggle').getAttribute('aria-pressed') === 'true';
      const amount = row.dataset.mode === 'percent' ? total * value / 100 : value;
      const share = total ? amount / total * 100 : 0;

      required<HTMLElement>(row, '.equivalent').textContent = row.dataset.mode === 'percent'
        ? `${money(amount)} of income`
        : `${percent(share)} of income`;
      if (enabled) allocated += amount;
    });

    const plannedPercent = total ? Math.round(allocated / total * 100) : 0;
    required<HTMLElement>(plan, '.leftover').textContent = money(total - allocated);
    required<HTMLElement>(plan, '.planned-percent').textContent = `${plannedPercent}% planned`;
    required<HTMLElement>(plan, '.progress-track span').style.transform = `scaleX(${Math.min(plannedPercent, 100) / 100})`;
  }

  const calculateAll = () => plans.querySelectorAll('.budget-plan').forEach(calculatePlan);

  plans.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const plan = target.closest('.budget-plan');
    if (!plan) return;

    if (target.classList.contains('category-toggle')) {
      const enabled = target.getAttribute('aria-pressed') !== 'true';
      const row = target.closest<HTMLElement>('.category-row');
      if (!row) return;
      const name = required<HTMLInputElement>(row, '.category-name').value;
      target.setAttribute('aria-pressed', String(enabled));
      target.setAttribute('aria-label', `${enabled ? 'Disable' : 'Enable'} ${name}`);
      target.classList.toggle('active', enabled);
      row.classList.toggle('disabled', !enabled);
      calculatePlan(plan);
    } else if (target.classList.contains('unit-btn')) {
      const row = target.closest<HTMLElement>('.category-row');
      if (!row) return;
      row.dataset.mode = target.dataset.mode;
      row.querySelectorAll('.unit-btn').forEach((button) => button.classList.toggle('active', button === target));
      calculatePlan(plan);
    } else if (target.classList.contains('remove-category')) {
      target.closest('.category-row')?.remove();
      calculatePlan(plan);
    } else if (target.classList.contains('add-category')) {
      required<HTMLElement>(plan, '.category-list').insertAdjacentHTML('beforeend', categoryMarkup());
      calculatePlan(plan);
    } else if (target.classList.contains('remove-plan')) {
      plan.remove();
    }
  });

  plans.addEventListener('input', (event) => {
    if (event.target instanceof Element) {
      const plan = event.target.closest('.budget-plan');
      if (plan) calculatePlan(plan);
    }
  });
  income.addEventListener('input', calculateAll);

  required<HTMLButtonElement>(document, '#add-plan').addEventListener('click', () => {
    const template = required<HTMLTemplateElement>(document, '#plan-template');
    const fragment = template.content.cloneNode(true) as DocumentFragment;
    const plan = required<HTMLElement>(fragment, '.budget-plan');
    const number = plans.querySelectorAll('.budget-plan').length + 1;
    required<HTMLInputElement>(plan, '.plan-name').value = `Paycheck ${number}`;
    required<HTMLElement>(plan, '.category-list').innerHTML = categoryMarkup();
    plans.append(fragment);
    calculatePlan(plan);
  });

  function buildExport(format: 'plain' | 'markdown') {
    const total = Number(income.value) || 0;
    let output = format === 'markdown'
      ? `# No Waste No Pain\n\nIncome per paycheck: **${money(total)}**\n`
      : `NO WASTE NO PAIN\n\nIncome per paycheck: ${money(total)}\n`;

    plans.querySelectorAll('.budget-plan').forEach((plan) => {
      const title = required<HTMLInputElement>(plan, '.plan-name').value;
      output += format === 'markdown'
        ? `\n## ${title}\n\n| Category | Budget | Equivalent |\n| :-- | --: | --: |\n`
        : `\n${title.toUpperCase()}\n${'─'.repeat(title.length)}\n`;
      plan.querySelectorAll<HTMLElement>('.category-row').forEach((row) => {
        if (required<HTMLButtonElement>(row, '.category-toggle').getAttribute('aria-pressed') !== 'true') return;
        const value = Number(required<HTMLInputElement>(row, '.category-value').value) || 0;
        const amount = row.dataset.mode === 'percent' ? total * value / 100 : value;
        const share = total ? amount / total * 100 : 0;
        const budget = row.dataset.mode === 'percent' ? percent(value) : money(value);
        const equivalent = row.dataset.mode === 'percent' ? money(amount) : percent(share);
        const name = required<HTMLInputElement>(row, '.category-name').value;
        output += format === 'markdown'
          ? `| ${tableCell(name)} | ${budget} | ${equivalent} |\n`
          : `• ${name}: ${budget} (${equivalent})\n`;
      });
      const leftover = required<HTMLElement>(plan, '.leftover').textContent;
      output += format === 'markdown'
        ? `\nLeftover: **${leftover}**\n`
        : `\nLeftover: ${leftover}\n`;
    });
    return output;
  }

  async function copyPlans(format: 'plain' | 'markdown') {
    await navigator.clipboard.writeText(buildExport(format));
    status.textContent = `Copied all plans as ${format === 'plain' ? 'plain text' : 'Markdown'}.`;
    setTimeout(() => status.textContent = 'Nothing leaves this browser.', 2200);
  }

  required<HTMLButtonElement>(document, '#copy-plain').addEventListener('click', () => copyPlans('plain'));
  required<HTMLButtonElement>(document, '#copy-markdown').addEventListener('click', () => copyPlans('markdown'));

  calculateAll();
}
