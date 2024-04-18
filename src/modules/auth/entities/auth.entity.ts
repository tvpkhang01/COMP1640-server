import { Column, PrimaryGeneratedColumn } from "typeorm";

export class Auth {
    @Column()
    id: string;
  
    @Column()
    userName: string;

    @Column()
    password: string;

    @Column()
    role: string;
}
