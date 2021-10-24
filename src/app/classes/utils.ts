/*** */

export function compareDOB(dob: Date, num: number) {
  if (dob && typeof dob === 'object') {
    let dobDay: number = dob.getDate(),
      dobMonth: number = dob.getMonth(),
      now: Date = new Date(),
      nowDay: number = now.getDate(),
      nowMonth: number = now.getMonth(),
      nowDayMonth: Date = new Date(0, nowMonth, nowDay),
      dobDayMonth: Date = new Date(0, dobMonth, dobDay),
      nowYear: number = now.getFullYear(),
      year: number = dobDayMonth >= nowDayMonth ? nowYear : nowYear + 1,
      birthDay: any = new Date(year, dobMonth, dobDay),
      nowZeroHours: any = new Date(nowYear, nowMonth, nowDay);

    return ((birthDay - nowZeroHours) / 86400000 < num);
  }
}

export function generatePassword(): string {
  const passLength = 8;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';

  for (let i = 0, n = charset.length; i < passLength; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
}

export function sanitize(model): any {
  const regexp = /\s|\(|\)|\-/g;
  if (typeof model === 'number') {
    model = String(model);
  }
  return model.replace(regexp, '')
}
