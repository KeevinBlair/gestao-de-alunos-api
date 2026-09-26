import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.js';
import { loginAdmin } from './helpers/loginAdmin.js';
import aluno from './data/aluno.json' with { type: 'json' };
import { loginAluno } from './helpers/loginAluno.js';
import Aluno from '../src/models/aluno.model.js';

let alunoId;

describe('Fluxo de cadastro de aluno', () => {
    before(async () => {
        await Aluno.deleteOne({ email: aluno.email });
    });

    it('deve realizar login como administrador', async () => {
        const tokenAdmin = await loginAdmin();

        expect(tokenAdmin).to.be.a('string');
        expect(tokenAdmin).to.not.be.empty;
    });

    it('deve cadastrar um novo aluno', async () => {
        const tokenAdmin = await loginAdmin();

        const resposta = await request(app)
            .post('/api/admin/alunos')
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                nome: aluno.nome,
                email: aluno.email,
                matricula: aluno.matricula,
                senha: aluno.senha,
            });

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('id');
        expect(resposta.body.nome).to.equal(aluno.nome);
        expect(resposta.body.email).to.equal(aluno.email);
        expect(resposta.body.matricula).to.equal(aluno.matricula);

        alunoId = resposta.body.id;
    });

    it('deve matricular o aluno em uma disciplina', async () => {
        const tokenAdmin = await loginAdmin();

        const resposta = await request(app)
            .post(`/api/admin/disciplinas/${aluno.disciplinaId}/matriculas`)
            .set('Authorization', `Bearer ${tokenAdmin}`)
            .send({
                alunoId,
            });

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('alunoId').that.equals(alunoId);
        expect(resposta.body).to.have.property('disciplinaId').that.equals(aluno.disciplinaId);
    });

    it('deve realizar login como aluno', async () => {
        const tokenAluno = await loginAluno(aluno.email, aluno.senha);

        expect(tokenAluno).to.be.a('string');
        expect(tokenAluno).to.not.be.empty;
    });

    it('deve registrar um trabalho como aluno', async () => {
        const tokenAluno = await loginAluno(aluno.email, aluno.senha);

        const resposta = await request(app)
            .post(`/api/alunos/${alunoId}/trabalhos`)
            .set('Authorization', `Bearer ${tokenAluno}`)
            .send({
                disciplinaId: aluno.disciplinaId,
                titulo: aluno.trabalho.titulo,
                descricao: aluno.trabalho.descricao,
            });

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('id');
        expect(resposta.body.alunoId).to.equal(alunoId);
        expect(resposta.body.disciplinaId).to.equal(aluno.disciplinaId);
        expect(resposta.body.titulo).to.equal(aluno.trabalho.titulo);
        expect(resposta.body.descricao).to.equal(aluno.trabalho.descricao);
    });

});
