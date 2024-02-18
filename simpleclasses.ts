
/** Represents a dollar amount. */
export class Dollars {
    #amount: number;

    constructor (dollars: string|number) {
        this.amount = dollars;
    }

    toString(): string {
        return this.#amount.toFixed(2);
    }
    valueOf(): number {
        // Ensures maximum of two decimal places to protect against floating point errors
        return parseFloat(this.#amount.toFixed(2));
    }
    [Symbol.toPrimitive](hint: string) {
        if (hint == "string")
            return this.toString();
        else
            return this.valueOf();
    }

    /** Adds the given dollar amount to this one. */
    add(dollars: Dollars|string|number): Dollars {
        switch (typeof(dollars)) {
            case "string":
                this.#amount += parseFloat(dollars);
                return this;
            case "number":
                this.#amount += dollars;
                return this;
            default:
                this.#amount += dollars.amount;
                return this;
        }
    }

    get amount(): number {
        return this.valueOf();
    }
    set amount(dollars: string|number) {
        if (typeof(dollars) == "string")
            this.#amount = parseFloat(dollars);
        else
            this.#amount = dollars;
    }
}

export class Category {
    readonly name: string;
    expense: Dollars;
    budget: Dollars;

    constructor(name: string, expense: number|string, budget: number|string) {
        this.name = name;
        this.expense = new Dollars(expense);
        this.budget = new Dollars(budget);
    }

    asObject(): object {
        return {
            name: this.name,
            expense: this.expense.amount,
            budget: this.budget.amount
        };
    }

    /** Returns true if the two categories have attributes that are all equivalent. */
    equals(otherCat: Category): boolean {
        return (this.name === otherCat.name && this.expense === otherCat.expense && this.budget === otherCat.budget);
    }

    static fromObject(obj: object): Category {
        return new Category(obj["name"], obj["expense"], obj["budget"]);
    }
}

export class User {
    readonly ID: string; // Unique user ID
    name: string;
    categories: Category[];

    constructor(id: string, name: string) {
        this.ID = id;
        this.name = name;
        this.categories = [];
    }

    totalExpenses(): Dollars {
        let total = new Dollars(0);
        for (let cat of this.categories)
            total.add(cat.expense);
        return total;
    }

    totalBudget(): Dollars {
        let total = new Dollars(0);
        for (let cat of this.categories)
            total.add(cat.budget);
        return total;
    }

    addCategory(category: Category) {
        this.categories.push(category);
    }

    /** Removes the category from the user that matches the given category.
     * @returns true if the category was found and removed, false otherwise.
     */
    removeCategory(category: Category): boolean {
        for (let i = 0; i < this.categories.length; i++) {
            if (this.categories[i].equals(category)) {
                this.categories.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    asObject(): object {
        return {
            ID: this.ID,
            name: this.name,
            categories: this.categories.map(c => c.asObject())
        };
    }

    static fromObject(obj: object): User {
        let user = new User(obj["id"], obj["name"]);
        for (let cat of obj["categories"])
            user.addCategory(Category.fromObject(cat));
        return user;
    }
}