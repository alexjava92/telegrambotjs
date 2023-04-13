//4.4 Синтаксис классов
class Employee {
    constructor(name, salary) {
        this.name = name
        this.salary = salary
    }
    raiseSalary(percent) {
        this.salary *= 1 + percent / 100
    }
}
const Alex = new Employee('Alex', 900000)
console.log(Alex)
Alex.raiseSalary(15)
console.log(Alex)

