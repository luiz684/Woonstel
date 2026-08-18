const telas = [
    "cadastro",
    "login",
    "recuperacao"
];

function mostrarTela(nome) {
    telas.forEach(id => {
        document.getElementById(id).classList.remove("active");
    });

    document.getElementById(nome).classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function mostrarMensagem(texto) {
    const toast = document.getElementById("toast");

    toast.textContent = texto;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

function configurarBotoesSenha() {
    document.querySelectorAll(".eye").forEach(button => {
        button.addEventListener("click", () => {
            const input = document.getElementById(button.dataset.target);

            input.type = input.type === "password"
                ? "text"
                : "password";
        });
    });
}

function aplicarMascaraCPF(input) {
    input.addEventListener("input", () => {
        let valor = input.value
            .replace(/\D/g, "")
            .slice(0, 11);

        if (valor.length > 9) {
            valor = valor.replace(
                /(\d{3})(\d{3})(\d{3})(\d{1,2})/,
                "$1.$2.$3-$4"
            );
        } else if (valor.length > 6) {
            valor = valor.replace(
                /(\d{3})(\d{3})(\d{1,3})/,
                "$1.$2.$3"
            );
        } else if (valor.length > 3) {
            valor = valor.replace(
                /(\d{3})(\d{1,3})/,
                "$1.$2"
            );
        }

        input.value = valor;
    });
}

function configurarCadastro() {
    const form = document.getElementById("cadastroForm");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const senha = document.getElementById("senhaCadastro").value;
        const confirmarSenha = document.getElementById("confirmarSenha").value;
        const tipo = document.getElementById("tipoCadastro").value;

        if (senha !== confirmarSenha) {
            mostrarMensagem("As senhas não são iguais.");
            return;
        }

        if (!tipo) {
            mostrarMensagem("Selecione o tipo de usuário.");
            return;
        }

        mostrarMensagem("Conta criada com sucesso!");

        setTimeout(() => {
            mostrarTela("login");
        }, 1000);
    });
}

function configurarLogin() {
    const form = document.getElementById("loginForm");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const cpf = document.getElementById("cpfLogin").value;
        const tipo = document.getElementById("tipoLogin").value;
        const senha = document.getElementById("senhaLogin").value;

        if (!cpf || !tipo || !senha) {
            mostrarMensagem("Preencha todos os campos.");
            return;
        }

        mostrarMensagem(`Login realizado como ${tipo}.`);
    });
}

function configurarRecuperacao() {
    const form = document.getElementById("recuperacaoForm");

    form.addEventListener("submit", event => {
        event.preventDefault();

        mostrarMensagem(
            "Se o e-mail estiver cadastrado, enviaremos as instruções."
        );
    });
}

function inicializar() {
    configurarBotoesSenha();

    aplicarMascaraCPF(
        document.getElementById("cpfCadastro")
    );

    aplicarMascaraCPF(
        document.getElementById("cpfLogin")
    );

    configurarCadastro();
    configurarLogin();
    configurarRecuperacao();
}

inicializar();
