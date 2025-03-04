const { 
    Client, GatewayIntentBits, Partials, EmbedBuilder, ActionRowBuilder, 
    ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, 
    ButtonStyle, Events 
} = require('discord.js');

require('dotenv').config(); // Carregar variáveis de ambiente

const TOKEN = process.env.BOT_TOKEN; // Token do bot via variável de ambiente

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.GuildMember]
});

// ID do cargo a ser atribuído (substitua pelo ID real do cargo)
const ROLE_ID = '1208220935400988682'; // Substitua com o ID do cargo que você deseja adicionar

// Registrar comando /setbutton ao iniciar o bot
client.once('ready', async () => {
    console.log(`Bot está online como ${client.user.tag}`);

    // Registrar o comando 'setbutton' no servidor
    const guild = client.guilds.cache.get('1208201761148379237'); // Substitua pelo ID do seu servidor
    if (guild) {
        await guild.commands.create({
            name: 'setbutton',
            description: 'Exibe o botão para setar informações',
        });
    }
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === 'open_form') {
            // Criando o modal
            const modal = new ModalBuilder()
                .setCustomId('set_user_info')
                .setTitle('Preencha suas informações');

            // Inputs do formulário
            const nameInput = new TextInputBuilder()
                .setCustomId('user_name')
                .setLabel('Nome na cidade:')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const idInput = new TextInputBuilder()
                .setCustomId('user_id')
                .setLabel('ID:')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const recruitedByInput = new TextInputBuilder()
                .setCustomId('recruited_by')
                .setLabel('Recrutado por:')
                .setStyle(TextInputStyle.Short)
                .setRequired(false);

           
            // Adicionando inputs ao modal
            modal.addComponents(
                new ActionRowBuilder().addComponents(nameInput),
                new ActionRowBuilder().addComponents(idInput),
                new ActionRowBuilder().addComponents(recruitedByInput),
                
            );

            await interaction.showModal(modal);
        }
    } else if (interaction.isModalSubmit()) {
        if (interaction.customId === 'set_user_info') {
            const name = interaction.fields.getTextInputValue('user_name');
            const id = interaction.fields.getTextInputValue('user_id');

            const newNickname = `${name} | ${id}`;

            try {
                // Verifica se a guild e o bot existem antes de acessar as permissões
                const botMember = await interaction.guild.members.fetch(client.user.id); // Garantir que o bot foi carregado completamente
                if (!botMember) {
                    await interaction.reply({ content: 'Não foi possível encontrar o bot no servidor.', ephemeral: true });
                    return;
                }

                const botRole = botMember.roles.highest.position;
                const memberRole = interaction.member.roles.highest.position;

                // Verifica se o bot tem uma função superior ao membro
                if (botRole <= memberRole) {
                    await interaction.reply({ content: 'Não posso alterar o apelido deste usuário devido à hierarquia de funções.', ephemeral: true });
                    return;
                }

                if (botMember.permissions.has('MANAGE_NICKNAMES')) {
                    await interaction.member.setNickname(newNickname);

                    // Embed para a resposta
                    const embed = new EmbedBuilder()
                        .setColor('#4CAF50') // Cor verde para sucesso
                        .setTitle('Sucesso!')
                        .setDescription(`Seu apelido foi alterado para **${newNickname}**`)
                        .setTimestamp()
                        .setFooter({ text: 'Bot Setagem', iconURL: client.user.displayAvatarURL() });

                    // Resposta visível apenas para o usuário
                    await interaction.reply({ embeds: [embed], ephemeral: true });

                    // Adicionar o cargo específico ao usuário
                    const member = await interaction.guild.members.fetch(interaction.member.id);
                    await member.roles.add(ROLE_ID); // Adiciona o cargo pelo ID

                    // Embed para a mensagem de sucesso do cargo
                    const roleEmbed = new EmbedBuilder()
                        .setColor('#2196F3') // Cor azul para sucesso no cargo
                        .setTitle('Cargo Adicionado!')
                        .setDescription('Você recebeu um novo cargo após atualizar seu apelido.')
                        .setTimestamp();

                    // Resposta visível apenas para o usuário
                    await interaction.followUp({ embeds: [roleEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Não tenho permissão para alterar apelidos.', ephemeral: true });
                }
            } catch (error) {
                console.error("Erro ao tentar alterar o apelido:", error);
                await interaction.reply({ content: `Erro ao tentar alterar seu apelido. Detalhes: ${error.message}`, ephemeral: true });
            }            
        }
    }

    if (interaction.isCommand() && interaction.commandName === 'setbutton') {
        // Criar botão com emoji e estilo
        const button = new ButtonBuilder()
            .setCustomId('open_form')
            .setLabel('Setar Informações')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('✍️'); 

        const row = new ActionRowBuilder().addComponents(button);

        // Embed para a mensagem inicial
        const embed = new EmbedBuilder()
            .setColor('#FF9800') // Cor laranja para a mensagem inicial
            .setTitle('INICIAR REGISTRO')
            .setDescription('Para iniciar o registro, clique em um dos botões abaixo e preencha o formulário correspondente.')
            .setTimestamp()
            .setFooter({ text: '© 2025 Rafael Emerick - Todos os direitos reservados' });

        await interaction.reply({ 
            embeds: [embed],
            components: [row] 
        });
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);



